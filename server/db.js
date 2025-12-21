const sqlite3 = require("sqlite3");
const config = require("./config");

const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) console.error("DB connection error:", err);
  else console.log("Connected to SQLite DB");
});

module.exports = db;
