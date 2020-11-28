const convert = require('convert-units');

exports.convertUnit = convertUnit;
function convertUnit(client, respond, message) {
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

exports.measures = measures;
function measures(client, respond, message) {
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
