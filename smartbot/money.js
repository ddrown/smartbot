const config = require('./config');
const fetch = require('node-fetch');
const querystring = require('querystring');

let rates;

exports.convertMoney = convertMoney;
async function convertMoney(amount, from, to) {
  if (rates === undefined || Date.now()/1000 - rates.timestamp > 86400) {
    console.log("loading exchange rates");
    const query = querystring.stringify({
      app_id: config.app_id
    });
    rates = await fetch(`https://openexchangerates.org/api/latest.json?${query}`).then(res => res.json());
    if (!rates.hasOwnProperty("timestamp")) {
      rates = undefined;
      throw new Error("Currency API failed to return the expected data");
    }
  }

  if (!rates.rates.hasOwnProperty(from)) {
    throw new Error(`does not have currency ${from}`);
  }
  if (!rates.rates.hasOwnProperty(to)) {
    throw new Error(`does not have currency ${to}`);
  }
  if (from === rates.base) {
    return amount * rates.rates[to];
  }
  if (to === rates.base) {
    return amount / rates.rates[from];
  }
  return amount / rates.rates[from] * rates.rates[to];
}


const cryptoNames = new Set(["XBT", "BTC", "ETH", "USDT", "ZEC"]);
async function crypto(amount, from, to) {
  const fromCrypto = cryptoNames.has(from);
  const cryptoName = fromCrypto ? from : to;
  const fiatName = fromCrypto ? to : from;
// c[0]
  const query = querystring.stringify({
    pair: `${cryptoName}${fiatName}`
  });
  const url = `https://api.kraken.com/0/public/Ticker?${query}`;
  const headers = {
    "User-Agent": `smartbot/0.1 (https://github.com/ddrown/smartbot) node-fetch/2.6.1`,
    "Accept": "application/json",
    "Accept-Language": "en"
  };

  const rates = await fetch(url, {headers}).then(res => res.json());
  if(rates.error !== undefined && rates.error.length > 0) {
    console.log(rates);
    throw new Error(rates.error[0]);
  }
  for (const [key, value] of Object.entries(rates.result)) {
    const lastPrice = parseFloat(value.c[0]);
    const newAmount = fromCrypto ? amount*lastPrice : amount/lastPrice;
    return newAmount;
  }
}

exports.money = money;
async function money(client, respond, message) {
  const command = message.split(' ');
  command.shift(); // !money
  if (command.length !== 3 && command.length !== 2) {
    client.say(respond, "!money # from to");
    return;
  }
  const amount = parseFloat(command.length === 3 ? command.shift() : "1");
  if (isNaN(amount)) {
    client.say(respond, "!money # from to");
    return;
  }
  const from = command.shift().toUpperCase();
  const to = command.shift().toUpperCase();
  const isCrypto = cryptoNames.has(from) || cryptoNames.has(to);
  const convertFunc = isCrypto ? crypto : convertMoney;
  try {
    const out = await convertFunc(amount, from, to);
    client.say(respond, `${amount} ${from} is ${out.toFixed(2)} ${to}`);
  } catch(e) {
    client.say(respond, `!money error: ${e.message}`);
  }
}
