const config = require('./config');
const {decode} = require('html-entities');
const fetch = require('node-fetch');
const querystring = require('querystring');
const {sleep} = require('./utils');
const {metaDescription} = require('./htmlurls');

const titleMapping = {
  "www.youtube.com": youtube,
  "youtube.com": youtube,
  "youtu.be": youtube,
  "twitter.com": twitter,
  "en.wikipedia.org": wikipedia,
  "reddit.com": reddit,
  "www.reddit.com": reddit,
  "old.reddit.com": reddit,
  "i.redd.it": redditImg,
  "v.redd.it": redditImg,
  "i.imgur.com": redditImg,
  "imgur.com": redditImg,
  "gfycat.com": redditImg,
  "www.reuters.com": metaDescription,
  "www.theglobeandmail.com": metaDescription
};

async function oembed(queryUrl, url) {
  const query = querystring.stringify({ url });
  return await fetch(`${queryUrl}?${query}`).then(res => res.json());
}

async function youtube(url) {
  const urlInfo = await oembed("https://www.youtube.com/oembed", url);
  return urlInfo.title;
}

async function twitter(url) {
  const urlInfo = await oembed("https://publish.twitter.com/oembed", url);
  const html = urlInfo.html;
  const newlineHtml = html.replace(/(<br>)+/ig, " ").replace(/([^ ])(<a)/ig, "$1 $2");
  return decode(newlineHtml.replace(/<[^>]*>/g, ""), {scope: "strict"});
}

async function reddit(url) {
  const urlInfo = await oembed("https://www.reddit.com/oembed", url);
  return urlInfo.title;
}

async function redditImg(url) {
  if (
      !url.match(/^https:\/\/[iv]\.redd\.it\/[a-zA-Z0-9]+(\.gif|\.jpg|\.png|)$/) &&
      !url.match(/^https:\/\/(i\.)?imgur.com\/[a-zA-Z0-9]+(\.gif|\.jpg|\.gifv|\.png|)$/) &&
      !url.match(/^https:\/\/gfycat.com\/[a-zA-Z0-9]+$/)
  ) {
    return;
  }
  const searchUrl = `https://www.reddit.com/search.json?q=url:${url}`;

  const headers = {
    "User-Agent": `smartbot/0.1 (https://github.com/ddrown/smartbot; ${config.email}) node-fetch/2.6.1`,
    "Accept": "application/json; charset=utf-8",
    "Accept-Language": "en"
  };

  const urlInfo = await fetch(searchUrl, {headers}).then(res => res.json());
  if(!urlInfo.data.children.length) {
    return;
  }
  const firstResult = urlInfo.data.children[0].data;
  return `[${firstResult.subreddit_name_prefixed}] ${firstResult.title}`;
}

async function wikipedia(url) {
  const pageMatch = url.match(/en.wikipedia.org\/wiki\/([^\/?#]+)/);
  if (!pageMatch) {
    return;
  }
  const pageName = pageMatch[1];
  const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${pageName}?redirect=false`;

  const headers = {
    "User-Agent": `smartbot/0.1 (https://github.com/ddrown/smartbot; ${config.email}) node-fetch/2.6.1`,
    "Accept": "application/json; charset=utf-8; profile=\"https://www.mediawiki.org/wiki/Specs/Summary/1.4.2\"",
    "Accept-Language": "en"
  };

  const urlInfo = await fetch(apiUrl, {headers}).then(res => res.json());
  return urlInfo.extract;
}

function fixSummary(summary) {
  if (summary === undefined || summary === null) {
    return;
  }
  if (summary.indexOf("\n") >= 0) {
    summary = summary.substring(0, summary.indexOf("\n")) + "...";
  }
  if (summary.length > 180) {
    return summary.substring(0, 180) + "...";
  }
  return summary;
}

let lastSawOtherBot = 0;

async function urlTitle(client, respond, message) {
  try {
    const url = message.match(/(https?:\/\/[\S]+)/);
    if(!url) {
      return;
    }

    const parsedUrl = new URL(url[1]);
    const getTitle = titleMapping[parsedUrl.host];
    if(!getTitle) {
      return;
    }

    // let the other bot respond first
    if(config.otherBot && respond === config.otherBot.channel) {
      await sleep(1500);

      const last = Date.now() - lastSawOtherBot;
      if (last < 2000) {
        return;
      }
    }

    const summary = fixSummary(await getTitle(parsedUrl.href));
    if(summary) {
      client.say(respond, `url: ${summary}`);
    }
  } catch(e) {
    console.log(`Error parsing message ${message}`);
    console.log(e);
  }
}
exports.urlTitle = urlTitle;

function otherBotTraffic(client, respond, message) {
  lastSawOtherBot = Date.now();
}
exports.otherBotTraffic = otherBotTraffic;
