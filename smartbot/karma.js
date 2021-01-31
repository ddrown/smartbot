const db = require("./db");
const karmadb = db.open('karma.sqlite');

async function startup() {
  try {
    const resp = await db.run(karmadb, "create table if not exists karma (username varchar primary key, karma int)");
  } catch(e) {
    console.log("failure creating karma database");
    console.log(e);
  }
}

async function _getKarma(name) {
  const user = await db.get(karmadb, "select karma from karma where username = ?", [name.toLowerCase()]);
  if(user) {
    return user.karma;
  } else {
    return 0;
  }
}

async function getKarma(client, respond, message) {
  const command = message.split(' ');
  if (command.length < 2) {
    client.say(respond, "!karma [nick]");
    return;
  }
  command.shift();
  const name = command[0];
  try {
    const karma = await _getKarma(name);
    client.say(respond, `${name} has ${karma} karma`);
  } catch(e) {
    console.log("failure getting user");
    console.log(e);
  }
}
exports.getKarma = getKarma;

async function _updateKarma(name, amount) {
  const sqlArgs = [
    name.toLowerCase(), amount, amount
  ];
  return db.run(karmadb, "insert into karma (username, karma) values (?,?) on conflict(username) do update set karma = karma + ?", sqlArgs);
}

async function updateKarma(client, respond, message, from) {
  const matching = message.match(/^([a-z0-9]+)(\+\+|--)$/i);
  if(!matching) {
    client.say(respond, "unknown karma command");
    return;
  }
  const amount = matching[2] === "--" ? -1 : 1;
  const name = matching[1];
  if (name.toLowerCase() === from.toLowerCase()) {
    client.say(respond, "You can't give yourself karma!");
    return;
  }
  try {
    await _updateKarma(name, amount);
    const karma = await _getKarma(name);
    client.say(respond, `${name} now has ${karma} karma`);
  } catch(e) {
    console.log("failure updating user");
    console.log(e);
  }
}
exports.updateKarma = updateKarma;

async function botsnack(client, respond, message) {
  await _updateKarma("smartbot", 1);
  const karma = await _getKarma("smartbot");
  client.say(respond, `thanks for the snack nom nom nom, I now have ${karma} karma`);
}
exports.botsnack = botsnack;

async function dumbbot(client, respond, message) {
  await _updateKarma("smartbot", -1);
  const karma = await _getKarma("smartbot");
  client.say(respond, `I'll have you know I'm very smart thank you very much, I now have ${karma} karma`);
}
exports.dumbbot = dumbbot;

startup();
