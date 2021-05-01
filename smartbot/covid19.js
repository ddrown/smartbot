const fetch = require('node-fetch');
const {pipeline} = require('stream');

const covidData = {
  data: {},
  timestamp: 0
};

async function getCovidData() {
  if(Date.now() - covidData.timestamp < 86400000) {
    return;
  }

  const data = await fetch("https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=statusBar_external_data").then(res => res.json());
  covidData.data = data;
  covidData.timestamp = Date.now();
}

async function getCases(client, respond, message) {
  try {
    await getCovidData();
    const date = covidData.data.statusBar[0]["cases-7-day"][0][1];
    const cases = covidData.data.statusBar[0]["cases-7-day"][0][0];
    const deaths = covidData.data.statusBar[0]["deaths-7-day"][0][0];
    const vaccines = covidData.data.statusBar[0]["Administered_US"];
    client.say(respond, `The 7 days ending on ${date}, there were ${cases} cases and ${deaths} deaths in the US. ${vaccines} vaccine doses have been administered.`);
  } catch(e) {
    console.log(e);
  }
}
exports.getCases = getCases;
