const db = require("../smartbot/db");
const citydb = db.open('cities.sqlite');
const citylist = require("./city.list.json");

async function main() {
  try {
    const resp = await db.run(citydb, "create table if not exists city (id int primary key, name varchar, state varchar, country varchar, lon number, lat number)");
  } catch(e) {
    console.log("failure creating city table");
    console.log(e);
  }
  console.log("loaded, starting");

  let i = 0;
  for (const city of citylist) {
    i++;
    if(i % 1000 === 0) {
      console.log(`at ${i}`);
    }
    await db.run(citydb, "insert into city (id, name, state, country, lon, lat) values (?,?,?,?,?,?)", [
      city.id,
      city.name,
      city.state,
      city.country,
      city.coord.lon,
      city.coord.lat
    ]);
  }
}

main();
