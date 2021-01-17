const fetch = require('node-fetch');
const csvparse = require('csv-parse');
const {pipeline} = require('stream');

const covidData = {
  lastTwo: [],
  timestamp: 0
};

async function getCovidData() {
  if(Date.now() - covidData.timestamp < 86400000) {
    return;
  }
  covidData.timestamp = Date.now();

  const req = await fetch("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv");
  const parser = req.body.pipe(csvparse());

  for await (const record of parser) {
    covidData.lastTwo.push(record);
    if(covidData.lastTwo.length > 2) {
      covidData.lastTwo.shift();
    }
  }
}

async function getCases(client, respond, message) {
  try {
    await getCovidData();
    const before = covidData.lastTwo[0];
    const after = covidData.lastTwo[1];
    const cases = after[1] - before[1];
    const deaths = after[2] - before[2];
    client.say(respond, `between ${before[0]} and ${after[0]}, there were ${cases} cases and ${deaths} deaths in the US`);
  } catch(e) {
    console.log(e);
  }
}
exports.getCases = getCases;
