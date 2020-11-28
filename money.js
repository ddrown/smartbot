const {config} = require('./config');
const fetch = require('node-fetch');
const querystring = require('querystring');

let rates;

exports.convertMoney = convertMoney;
async function convertMoney(amount, from, to) {
  if (rates === undefined || Date.now()/1000 - rates.timestamp > 86400) {
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

exports.money = money;
async function money(client, respond, message) {
  const command = message.split(' ');
  if (command.length !== 4) {
    client.say(respond, "!money # from to");
    return;
  }
  const amount = parseFloat(command[1]);
  if (isNaN(amount)) {
    client.say(respond, "!money # from to");
    return;
  }
  const from = command[2];
  const to = command[3];
  try {
    const out = await convertMoney(amount, from, to);
    client.say(respond, `${amount} ${from} is ${out.toFixed(2)} ${to}`);
  } catch(e) {
    client.say(respond, `!money error: ${e.message}`);
  }
}
