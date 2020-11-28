const config = require('./smartbot/config');
const commands = require('./reloadingCommands');
const irc = require('irc');

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

client.addListener('motd', (motd) => {
  console.log("connected, joining");
  client.join(config.channel);
});
