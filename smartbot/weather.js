const config = require('./config');
const convert = require('convert-units');
const fetch = require('node-fetch');
const querystring = require('querystring');

async function getWeather(city) {
  console.log(`loading weather for ${city}`);
  const query = querystring.stringify({
    q: city,
    appid: config.weather_app_id,
    units: "metric"
  });
  console.log(query);
  const conditions = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`).then(res => res.json());
  console.log(conditions);
  if (!conditions.hasOwnProperty("main")) {
    throw new Error("Weather API failed to return the expected data");
  }

  const degC = Math.floor(conditions.main.temp);
  const degF = Math.floor(convert(conditions.main.temp).from("C").to("F"));

  return `${conditions.weather[0].description} at ${conditions.name}, ${degC} C / ${degF} F, ${conditions.main.humidity} %RH, wind ${conditions.wind.speed} m/s`;
}

exports.weather = weather;
async function weather(client, respond, message) {
  const command = message.split(' ');
  if (command.length !== 2) {
    client.say(respond, "!weather [city]");
    return;
  }
  const city = command[1];
  try {
    const out = await getWeather(city);
    client.say(respond, out);
  } catch(e) {
    client.say(respond, `!weather error: ${e.message}`);
  }
}
