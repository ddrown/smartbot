const fetch = require('node-fetch');
const querystring = require('querystring');
const config = require('./config');

exports.getCity = getCity;
async function getCity(lat, lon) {
  const params = {
    key: config.google_geocode_apikey,
    latlng: `${lat},${lon}`,
  };
  const query = querystring.stringify(params);
  const cityData = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query}`).then(res => res.json());
  if (!cityData || cityData.status !== "OK" || cityData.results.length === 0) {
    console.log(`google api failed looking up lat=${lat} lon=${lon}`);
    console.log(cityData);
    return undefined;
  }

  for (const address of cityData.results[0].address_components) {
    if (address.types[0] === "administrative_area_level_1" && address.types[1] === "political") {
      return address.short_name;
    }
  }

  return undefined;
}
