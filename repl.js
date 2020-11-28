const commands = require('./reloadingCommands');
const repl = require('repl');

const mockClient = {
  say: (target, message) => {
    console.log(`${target} => ${message}`);
  }
};

const replServer = repl.start({
  prompt: 'irc> ',
  eval: (line) => {
    commands.onMessage(mockClient, "repl", "repl", line);
    replServer.displayPrompt();
  }
});
