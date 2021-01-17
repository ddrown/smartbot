let commands = require('./smartbot/commands');
const fs = require('fs');

let reloadId;
let reloadSet = new Set();

function reloadModules() {
  reloadId = undefined;
  console.log("reloadModules called");

  for (const file of reloadSet) {
    console.log(`clearing ${file} cache`);
    delete require.cache[require.resolve(`./smartbot/${file}`)];
  }
  reloadSet.clear();

  // force commands to reload
  delete require.cache[require.resolve("./smartbot/commands")];
  commands = require("./smartbot/commands");
}

function fileEvents(eventType, filename) {
  if (filename.endsWith(".js") || filename.endsWith(".json")) {
    reloadSet.add(filename);
    if (reloadId === undefined) {
      // allow 500ms to combine all the changes
      reloadId = setTimeout(reloadModules, 500);
    }
  }
}
fs.watch("./smartbot", { persistent: false }, fileEvents);

exports.onMessage = onMessage;
function onMessage(client, from, reply, message) {
  commands.onMessage(client, from, reply, message);
}
