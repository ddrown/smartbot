const config = require('./config');
const fetch = require('node-fetch');

function fixSummary(summary) {
  const maxlen = 250;

  if (summary === undefined || summary === null) {
    return;
  }

  summary = summary.replace(/[\x00-\x1F\r\n]/g, ' ').trim();
  if (summary.length > maxlen) {
    return summary.substring(0, maxlen) + "...";
  }
  return summary;
}

const questions = [
    "<peep1> Hello, who are you?\n<smartbot> I am an AI created by OpenAI. How can I help you today?\n",
];

async function getGpt3(text) {
  const context = [
    "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n",
    ...questions
  ];
  const request = {
    "stop": ["\n", "<smartbot>", "<peep1>"],
    "prompt": [
      `${context.join("")}<peep1> ${text}\n<smartbot>`
    ],
    "max_tokens": 60,
    "n": 1,
    "temperature": 0.9,
    "best_of": 1
  };
  console.log(request);
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
  const choice = bot.choices.filter(result => result.text.length > 0);
  if (choice.length === 0) {
    return "[no output]";
  }
  const answer = fixSummary(choice[0].text);

  questions.push(`<peep1> ${text}\n<smartbot> ${answer}\n`);
  if (questions.length > 10) {
    questions.shift();
  }

  return answer;
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
