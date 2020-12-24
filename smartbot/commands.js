const {money} = require("./money");
const {convertUnit, measures} = require("./units");
const {weather} = require("./weather");
const {doMath} = require("./math");

exports.onMessage = onMessage;
function onMessage(client, from, respond, message) {
  message = message.trim();

  if (message === "who's a smart bot?") {
    client.say(respond, "that's me!");
  } else if (message === "!botsnack") {
    client.say(respond, "thanks for the snack nom nom nom");
  } else if (message === "dumb bot") {
    client.say(respond, "I'll have you know I'm very smart thank you very much");
  } else if (message.startsWith("!convert ")) {
    convertUnit(client, respond, message);
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
  }
}

console.log("loaded commands");
