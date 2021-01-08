const fetch = require('node-fetch');
const querystring = require('querystring');
const {sleep} = require('./utils');

const omebedMapping = {
  "youtube.com": {
    url: "https://www.youtube.com/oembed",
    output: youtubeTitle
  },
  "youtu.be": {
    url: "https://www.youtube.com/oembed",
    output: youtubeTitle
  },
  "twitter.com": {
    url: "https://publish.twitter.com/oembed",
    output: tweet
  },
};

function youtubeTitle(urlInfo) {
  return urlInfo.title;
}

function tweet(urlInfo) {
  const html = urlInfo.html;
  return html.replace(/<[^>]*>/g, "");
}

let lastSawOtherBot = 0;

async function urlTitle(client, respond, message) {
  try {
    const url = message.match(/(https?:\/\/[\S]+)/);
    if(!url) {
      return;
    }

    const parsedUrl = new URL(url[1]);
    if(!omebedMapping[parsedUrl.host]) { 
      return;
    }

    const dataUrl = omebedMapping[parsedUrl.host];

    await sleep(1500);

    const last = Date.now() - lastSawOtherBot;
    if (last < 2000) {
      return;
    }

    const query = querystring.stringify({
      url: parsedUrl.href
    });
    const urlInfo = await fetch(`${dataUrl.url}?${query}`).then(res => res.json());
    const title = dataUrl.output(urlInfo);
    client.say(respond, `url: ${title}`);
  } catch(e) {
    console.log(`Error parsing message ${message}`);
    console.log(`URL: ${url[1]}`);
    console.log(e);
  }
}
exports.urlTitle = urlTitle;

function otherBotTraffic(client, respond, message, from) {
  lastSawOtherBot = Date.now();
}
exports.otherBotTraffic = otherBotTraffic;
