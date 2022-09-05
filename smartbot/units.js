const convert = require('convert-units');
const speed = require('convert-units/lib/definitions/speed');
const power = require('convert-units/lib/definitions/power');

speed.imperial.mph = speed.imperial["m/h"];
speed.metric.mach = {
  name: { singular: 'mach', plural: 'mach' },
  to_anchor: 1234.8
};
power.metric.hp = {
  name: { singular: 'hp', plural: 'hp' },
  to_anchor: 745.7
};

const unitAlias = {
  mile: "mi",
  miles: "mi",
  "mi/h": "mph",
  degC: "C",
  degF: "F",
  floz: "fl-oz"
};

function unit(name) {
  if (unitAlias[name] !== undefined) {
    return unitAlias[name];
  }
  return name;
}

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
  const from = unit(command[2]);
  const to = unit(command[3]);
  try {
    const out = convert(amount).from(from).to(to);
    client.say(respond, `${amount} ${from} is ${out.toFixed(2)} ${to}`);
  } catch(e) {
    const message = e.message.length > 100 ? e.message.substring(0, 100) + "..." : e.message;
    client.say(respond, `!convert error: ${message}`);
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

exports.ctof = ctof;
function ctof(client, respond, message) {
  const command = message.split(' ');
  if (command.length !== 2) {
    client.say(respond, "!ctof #");
    return;
  }
  const amount = parseInt(command[1], 10);
  if (isNaN(amount)) {
    client.say(respond, "!ctof #");
    return;
  }
  convertUnit(client, respond, `!convert ${amount} C F`);
}

exports.ftoc = ftoc;
function ftoc(client, respond, message) {
  const command = message.split(' ');
  if (command.length !== 2) {
    client.say(respond, "!ftoc #");
    return;
  }
  const amount = parseInt(command[1], 10);
  if (isNaN(amount)) {
    client.say(respond, "!ftoc #");
    return;
  }
  convertUnit(client, respond, `!convert ${amount} F C`);
}
