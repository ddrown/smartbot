const {parse} = require('node-html-parser');
const fetch = require('node-fetch');

async function metaDescription(url) {
  const html = await fetch(url).then(res => res.text());
  if(!html) {
    return "[no html returned]";
  }
  const dom = parse(html);
  if(!dom) {
    return "[parser failure]";
  }
  const metaDescription = dom.querySelector("meta[name='description']");
  if(!metaDescription) {
    return "[no meta description]";
  }
  return metaDescription.getAttribute("content");
}
exports.metaDescription = metaDescription;
