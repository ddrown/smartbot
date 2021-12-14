const config = require('./config');
const commands = require('../reloadingCommands');
const {sleep} = require('../smartbot/utils');
const { App } = require('@slack/bolt');

commands.startWatching("../smartbot");

function createFakeClient(say) {
  return {
    say: (respond, text) => {
      say(text);
    },
  };
}

async function main() {
  const app = new App({
    token: config.slack_oauth_token,
    signingSecret: config.slack_signing_secret,
    socketMode: true,
    appToken: config.slack_app_token,
    port: config.port || 3000
  });

  app.message(async ({message, say}) => {
    if (message.user === undefined) {
      return;
    }
    console.log(`${message.user} => ${message.channel}: ${message.text}`);
    const fakeClient = createFakeClient(say);
    commands.onMessage(fakeClient, message.user, message.channel, message.text);
  });

  await app.start();

  console.log("bot is running");
}

main();
