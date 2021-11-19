const config = require('./config');
const fetch = require('node-fetch');

function fixSummary(summary) {
  const maxlen = 250;

  if (summary === undefined || summary === null) {
    return;
  }
  summary = summary.replace(/[\x00-\x1F\r\n]/g, ' ');
  if (summary.length > maxlen) {
    return summary.substring(0, maxlen) + "...";
  }
  return summary;
}

async function getGpt3(text) {
  const request = {
    "prompt": text,
    "max_tokens": 60,
    "echo": true,
  };
  const resp = await fetch(
    "https://api.openai.com/v1/engines/davinci/completions",
    {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.openai_key}`
      }
    }
  );
  const bot = await resp.json();
  console.log(bot);
  return fixSummary(bot.choices[0].text);
}

exports.gpt3 = gpt3;
async function gpt3(client, respond, message) {
  const command = message.split(' ');
  if (command.length < 2) {
    client.say(respond, "!gpt3 [text]");
    return;
  }
  command.shift();
  const text = command.join(" ");
  try {
    const out = await getGpt3(text);
    client.say(respond, out);
  } catch(e) {
    client.say(respond, `!gpt3 error: ${e.message}`);
  }
}
