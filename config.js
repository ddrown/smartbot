const fs = require('fs');

exports.config = JSON.parse(fs.readFileSync("config.json"));
