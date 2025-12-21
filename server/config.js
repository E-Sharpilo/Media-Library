const path = require("path");

const ROOT = path.resolve(__dirname, "..");

module.exports = {
  ROOT,
  DB_PATH: path.join(ROOT, "db", "videos.db"),
  VLC_PATH: path.join(ROOT, "vlc_portable", "VLCPortable.exe"),
  UI_PATH: path.join(ROOT, "ui", "build"),
  VIDEOS_PATH: path.join(ROOT, "videos"),
  THUMBNAILS_PATH: path.join(ROOT, "thumbnails"),
  ACTORS_PHOTOS_PATH: path.join(ROOT, "actors_photos"),
};