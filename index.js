const irc = require('irc');
const convert = require('convert-units');
const fs = require('fs');

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
    client.say(respond, `${amount} ${from} is ${out} ${to}`);
  } catch(e) {
    client.say(respond, `error: ${e.message}`);
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
