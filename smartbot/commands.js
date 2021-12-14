const config = require("./config");
const {money} = require("./money");
const {convertUnit, measures, ctof, ftoc} = require("./units");
const {weather} = require("./weather");
const {doMath} = require("./math");
const {redditCat} = require("./reddit");
const {urlTitle, otherBotTraffic} = require("./urls");
const {getCases} = require("./covid19");
const {finance} = require("./finance");
const {getKarma, updateKarma, botsnack, dumbbot} = require("./karma");
const {gpt3} = require("./gpt3");

exports.onMessage = onMessage;
function onMessage(client, from, respond, message) {
  message = message.trim();

  if (config.otherBot && from === config.otherBot.nick) {
    otherBotTraffic(client, respond, message);
  } else if (message === "who's a smart bot?") {
    client.say(respond, "that's me!");
  } else if (message === "!botsnack") {
    botsnack(client, respond, message);
  } else if (message === "dumb bot") {
    dumbbot(client, respond, message);
  } else if (message.startsWith("!convert ")) {
    convertUnit(client, respond, message);
  } else if (message.startsWith("!ctof ")) {
    ctof(client, respond, message);
  } else if (message.startsWith("!ftoc ")) {
    ftoc(client, respond, message);
  } else if (message.startsWith("!measures ") || message === "!measures") {
    measures(client, respond, message);
  } else if (message.startsWith("!money ")) {
    money(client, respond, message);
  } else if (message === "gross") {
    client.say(respond, "Yeah, gross!");
  } else if (message.startsWith("!weather ") || message === "!weather") {
    weather(client, respond, message);
  } else if (message.startsWith("!math ") || message === "!math") {
    doMath(client, respond, message);
  } else if (message === "!cat") {
    redditCat(client, respond, message);
  } else if (message.match(/https?:\/\//) && !config.ignoreUrls) {
    urlTitle(client, respond, message);
  } else if (message === "!hack") {
    client.say(respond, "No hax smartbot!");
  } else if (message.startsWith("!finance ") || message === "!finance") {
    finance(client, respond, message);
  } else if (message.match(/is the pandemic over yet\?/i)) {
    getCases(client, respond, message);
  } else if (message.startsWith("!karma ") || message === "!karma") {
    getKarma(client, respond, message);
  } else if (message.match(/^[a-z0-9]+(\+\+|--)$/i)) {
    updateKarma(client, respond, message, from);
  } else if (message === "!starman") {
    client.say(respond, "https://dan.drown.org/starman.html");
  } else if (message.startsWith("!gpt3 ")) {
    gpt3(client, respond, message);
  } else if (message.startsWith("!rejoin ")) {
    rejoin(client, message);
  }
}

async function rejoin(client, message) {
  const command = message.split(" ");
  command.shift();
  const channel = command.join(" ");
  if(typeof config.channel !== "object") {
    return;
  }
  config.channel.forEach((configCh) => {
    if (configCh === channel) {
      client.join(channel)
    }
  });
}

console.log("loaded commands");
