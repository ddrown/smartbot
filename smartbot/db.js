const sqlite3 = require('sqlite3').verbose();

function open(filename) {
  return new sqlite3.Database(filename);
}
exports.open = open;

async function get(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if(err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}
exports.get = get;

async function run(db, sql, params) {
  return new Promise((resolve, reject) => {
    // can't use arrow function because we want the "this" context
    db.run(sql, params, function(err) {
      if(err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes
        });
      }
    });
  });
}
exports.run = run;
