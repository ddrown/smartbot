const {money} = require("./money");
const {convertUnit, measures} = require("./units");

exports.onMessage = onMessage;
function onMessage(client, from, respond, message) {
  message = message.trim();

  if (message === "who's a smart bot?") {
    client.say(respond, "that's me!");
  } else if (message.startsWith("!convert ")) {
    convertUnit(client, respond, message);
  } else if (message.startsWith("!measures ") || message === "!measures") {
    measures(client, respond, message);
  } else if (message.startsWith("!money ")) {
    money(client, respond, message);
  }
}
