const config = require('./smartbot/config');
const commands = require('./reloadingCommands');
const irc = require('irc');
const {sleep} = require('./smartbot/utils');

commands.startWatching("./smartbot");

const ircOptions = {
  userName: config.username,
  realName: config.realname,
  secure: true,
  selfSigned: true,
  port: config.serverport || 6697,
  debug: false,
  retryDelay: 120000,
  retryCount: 1,
};

const client = new irc.Client(config.server, config.nick, ircOptions);

client.addListener('message', (from, to, message) => {
  if (to.startsWith("#")) {
    console.log(`${from} => ${to}: ${message}`);
    commands.onMessage(client, from, to, message);
  }
});

client.addListener('pm', (from, message) => {
  commands.onMessage(client, from, from, message);
  console.log(`${from} => ME: ${message}`);
});

client.addListener('ctcp-version', (from, to, message) => {
  if (!to.startsWith("#")) {
    client.ctcp(from, "notice", "VERSION smartbot v1.0");
  } else {
    console.log(`${from} => ${to} ${message}, ignored`);
  }
});

let connected = false;
client.addListener('motd', (motd) => {
  connected = true;
  console.log("connected, joining");
  if(typeof config.channel === "object") {
    config.channel.forEach((channel) => client.join(channel));
  } else {
    client.join(config.channel);
  }
});

client.addListener('abort', async (count) => {
  connected = false;
  console.log(`aborted after ${count} times`);
  await sleep(300000);
  if (!connected) {
    console.log("Trying to connect again");
    client.connect(0);
  } else {
    console.log("Already reconnected");
  }
});
