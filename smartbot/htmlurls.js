const {parse} = require('node-html-parser');
const fetch = require('node-fetch');

async function urlQueryElement(url, selector) {
  const html = await fetch(url).then(res => res.text());
  if(!html) {
    return "[no html returned]";
  }
  const dom = parse(html);
  if(!dom) {
    return "[parser failure]";
  }
  const element = dom.querySelector(selector);
  if(!element) {
    return "[no element selected]";
  }
  return element;
}

async function metaDescription(url) {
  const metaDescription = await urlQueryElement(url, "meta[name='description']");
  if(typeof metaDescription === "string") {
    return metaDescription;
  }
  return metaDescription.getAttribute("content");
}
exports.metaDescription = metaDescription;

async function title(url) {
  const titleText = await urlQueryElement(url, "title");
  if(typeof titleText === "string") {
    return titleText;
  }
  return titleText.text;
}
exports.title = title;

async function ogTitle(url) {
  const titleText = await urlQueryElement(url, "meta[property='og:title']");
  if(typeof titleText === "string") {
    return titleText;
  }
  return titleText.getAttribute("content");
}
exports.ogTitle = ogTitle;
