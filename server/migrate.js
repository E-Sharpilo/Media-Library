const sqlite3 = require("sqlite3");
const config = require("./config");

const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) return console.error("DB connection error:", err);
  console.log("Connected to SQLite DB");
});

const dropTables = `
DROP TABLE IF EXISTS video_actors;
DROP TABLE IF EXISTS video_tags;
DROP TABLE IF EXISTS actors;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS categories;
`;

db.exec(dropTables, (err) => {
  if (err) console.error("Error dropping tables:", err);
  else console.log("Old tables dropped (if existed)");
});

const createTables = `
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  release_date TEXT,
  path TEXT,
  rating REAL,
  thumbnail TEXT,
  favorite INTEGER DEFAULT 0,
  size INTEGER,
  category_id INTEGER,
  saved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS actors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  photo TEXT
);

CREATE TABLE IF NOT EXISTS video_tags (
  video_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY(video_id, tag_id),
  FOREIGN KEY(video_id) REFERENCES videos(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id)
);

CREATE TABLE IF NOT EXISTS video_actors (
  video_id INTEGER,
  actor_id INTEGER,
  PRIMARY KEY(video_id, actor_id),
  FOREIGN KEY(video_id) REFERENCES videos(id),
  FOREIGN KEY(actor_id) REFERENCES actors(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folder_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(createTables, (err) => {
  if (err) console.error("Error creating tables:", err);
  else console.log("Tables created successfully");
  db.close();
});
