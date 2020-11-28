const convert = require('convert-units');
const fetch = require('node-fetch');
const fs = require('fs');
const irc = require('irc');
const querystring = require('querystring');

const config = JSON.parse(fs.readFileSync("config.json"));

const ircOptions = {
  userName: config.username,
  realName: config.realname,
  secure: true,
  selfSigned: true,
  port: 6697,
  debug: false,
  retryDelay: 60000,
};

const client = new irc.Client(config.server, config.nick, ircOptions);

let rates;

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

async function money(respond, message) {
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

function convertUnit(respond, message) {
  const command = message.split(' ');
  if (command.length !== 4) {
    client.say(respond, "!convert # from to");
    return;
  }
  const amount = parseInt(command[1], 10);
  if (isNaN(amount)) {
    client.say(respond, "!convert # from to");
    return;
  }
  const from = command[2];
  const to = command[3];
  try {
    const out = convert(amount).from(from).to(to);
    client.say(respond, `${amount} ${from} is ${out.toFixed(2)} ${to}`);
  } catch(e) {
    client.say(respond, `!convert error: ${e.message}`);
  }
}

function measures(respond, message) {
  const command = message.split(' ');
  if (command.length !== 1 && command.length !== 2) {
    client.say(respond, "!measures [type]");
    return;
  }
  if (command.length === 1) {
    const measures = convert().measures();
    client.say(respond, `supported measures: ${measures.join(", ")}`);
    return;
  }
  try {
    const possibilities = convert().possibilities(command[1]);
    client.say(respond, `units: ${possibilities.join(", ")}`);
  } catch(e) {
    client.say(respond, `error: ${e.message}`);
  }
}

function onMessage(from, respond, message) {
  if (message === "who's a smart bot?") {
    client.say(respond, "that's me!");
  } else if (message.startsWith("!convert ")) {
    convertUnit(respond, message);
  } else if (message.startsWith("!measures ") || message === "!measures") {
    measures(respond, message);
  } else if (message.startsWith("!money ")) {
    money(respond, message);
  }
}

client.addListener('message', (from, to, message) => {
  if (to.startsWith("#")) {
    console.log(`${from} => ${to}: ${message}`);
    onMessage(from, to, message);
  }
});

client.addListener('pm', (from, message) => {
  onMessage(from, from, message);
  console.log(`${from} => ME: ${message}`);
});

client.addListener('motd', (motd) => {
  console.log("connected, joining");
  client.join(config.channel);
});
