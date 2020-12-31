const fetch = require('node-fetch');

const subreddits = new Map();

async function getSubreddit(name) {
  const cached = subreddits.get(name);
  if(cached && Date.now() - cached.timestamp < 86400000) {
    return cached.data;
  }

  const data = await fetch(`https://www.reddit.com/r/${name}.json`).then(res => res.json());
  subreddits.set(name, {
    timestamp: Date.now(),
    data,
  });
  return data;
}

exports.redditCat = redditCat;
async function redditCat(client, respond, message) {
  try {
    const posts = await getSubreddit("cats");
    const cats = posts.data.children.filter((post) => post && post.data && post.data.link_flair_text === "Cat Picture");
    if(cats.length === 0) {
      client.say(respond, "No cats found :(");
      return;
    }
    const cat = cats[Math.floor(Math.random()*cats.length)];
    client.say(respond, `cat: ${cat.data.url} ${cat.data.title}`);
  } catch(e) {
    client.say(respond, `!cat error: ${e.message}`);
  }
}
