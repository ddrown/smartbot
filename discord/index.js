const config = require('./config');
const commands = require('../reloadingCommands');
const {sleep} = require('../smartbot/utils');
const discord = require('discord.js');

commands.startWatching("../smartbot");

const client = new discord.Client();

client.login(config.discord_bot_token);

function createFakeClient(message) {
  return {
    say: (respond, text) => {
      message.reply(text);
    },
  };
}

function messageToChannelName(message) {
  if (message.channel.type === "dm") {
    return message.channel.recipient.username;
  }
  if (message.channel.name !== undefined) {
    return message.channel.name;
  }
  return message.channel;
}

client.on("message", (message) => {
  if (message.author.bot) return;

  const fakeClient = createFakeClient(message);
  const channelName = messageToChannelName(message);
  const from = message.author.username;
  console.log(`${from} => ${channelName}: ${message.content}`);
  commands.onMessage(fakeClient, from, channelName, message.content);
});
