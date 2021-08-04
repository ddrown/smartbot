const config = require('./config');
const convert = require('convert-units');
const fetch = require('node-fetch');
const querystring = require('querystring');
const db = require("./db");
const citylookup = require("./citylookup");
const citydb = db.open('cities.sqlite');

const forcecountries = {
  dublin: "ie"
};

async function getWeather(city) {
  console.log(`loading weather for ${city}`);
  const params = {
    appid: config.weather_app_id,
    units: "metric"
  };
  let forceCountry;

  if(city.match(/^\d+$/)) {
    params.zip = `${city},us`;
    forceCountry = "us";
  } else if(forcecountries.hasOwnProperty(city.toLowerCase())) {
    forceCountry = forcecountries[city.toLowerCase()];
    params.q = `${city},${forceCountry}`;
  } else {
    params.q = city;
  }
  const query = querystring.stringify(params);
  const conditions = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`).then(res => res.json());
  console.log(conditions);
  if (!conditions.hasOwnProperty("main")) {
    throw new Error("Weather API failed to return the expected data");
  }

  const cityPromise = db.get(citydb, "select state, country, lat, lon from city where id = ?", [conditions.id]);

  const degC = Math.floor(conditions.main.temp);
  const degF = Math.floor(convert(conditions.main.temp).from("C").to("F"));

  const kmh = Math.floor(conditions.wind.speed * 3600 / 1000);
  const mph = Math.floor(convert(kmh).from("km/h").to("mph"));

  const cityName = await getCityName(await cityPromise, forceCountry, conditions.name, conditions.id, conditions.coord);

  return `${conditions.weather[0].description} at ${cityName}, ${degC} C / ${degF} F, ${conditions.main.humidity} %RH, wind ${kmh} km/h / ${mph} mph`;
}

async function getCityName(cityData, forceCountry, name, id, coord) {
  const country = forceCountry ? forceCountry : cityData && cityData.country;

  if (cityData) {
    if (cityData.state) {
      return `${name}, ${cityData.state}, ${country}`;
    }

    console.log(`looking up state for ${name}`);
    const state = await citylookup.getCity(cityData.lat, cityData.lon);
    if (state) {
      await db.run(citydb, "update city set state=? where id=?", [state, id]);
      return `${name}, ${state}, ${country}`;
    }
    console.log(`lookup failed for ${cityData.lat} ${cityData.lon}`);
  }

  if (coord.lat && coord.lon) {
    const state = await citylookup.getCity(coord.lat, coord.lon);
    if (state) {
      return `${name}, ${state}, ${country}`;
    }
    console.log(`lookup failed for ${coord.lat} ${coord.lon}`);
  }

  console.log(`no db data for id=${id} name=${name}`);
  return name;
}

exports.weather = weather;
async function weather(client, respond, message) {
  const command = message.split(' ');
  if (command.length < 2) {
    client.say(respond, "!weather [city]");
    return;
  }
  command.shift();
  const city = command.join(" ");
  try {
    const out = await getWeather(city);
    client.say(respond, out);
  } catch(e) {
    client.say(respond, `!weather error: ${e.message}`);
  }
}
