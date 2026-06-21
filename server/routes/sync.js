const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../db");
const config = require("../config");

const router = express.Router();

const VIDEO_EXTENSIONS = new Set([
  ".avi",
  ".m4v",
  ".mkv",
  ".mov",
  ".mp4",
  ".mpeg",
  ".mpg",
  ".ts",
  ".webm",
  ".wmv",
]);

const isVideoFile = (filePath) =>
  VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());

async function syncVideos() {
  const folders = fs.readdirSync(config.VIDEOS_PATH);

  folders.forEach((folder) => {
    const folderPath = path.join(config.VIDEOS_PATH, folder);
    if (!fs.statSync(folderPath).isDirectory()) return;

    db.get(
      "SELECT id FROM categories WHERE folder_name=?",
      [folder],
      (err, categoryRow) => {
        if (err) return console.error(err);

        const createCategoryIfNeeded = (callback) => {
          if (!categoryRow) {
            db.run(
              "INSERT INTO categories (folder_name, display_name) VALUES (?, ?)",
              [folder, folder],
              function (err) {
                if (err) return console.error(err);
                callback(this.lastID);
              }
            );
          } else {
            callback(categoryRow.id);
          }
        };

        createCategoryIfNeeded((categoryId) => {
          const files = fs.readdirSync(folderPath);
          files.forEach((file) => {
            const fullPath = path.join(folderPath, file);
            if (!fs.statSync(fullPath).isFile() || !isVideoFile(fullPath)) {
              return;
            }

            const relPath = path.join(folder, file);

            db.get(
              "SELECT id FROM videos WHERE path=?",
              [relPath],
              (err, row) => {
                if (!row) {
                  const stats = fs.statSync(fullPath);
                  db.run(
                    "INSERT INTO videos (path, size, category_id, saved) VALUES (?, ?, ?, 0)",
                    [relPath, stats.size, categoryId]
                  );
                }
              }
            );
          });
        });
      }
    );
  });

  db.all("SELECT id, path FROM videos", [], (err, rows) => {
    rows.forEach((row) => {
      const fullPath = path.join(config.VIDEOS_PATH, row.path);
      if (!fs.existsSync(fullPath) || !isVideoFile(fullPath)) {
        db.run("DELETE FROM videos WHERE id=?", [row.id]);
      }
    });
  });
}

router.post("/", async (req, res) => {
  try {
    await syncVideos();
    res.json({ status: "Sync completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sync failed" });
  }
});

module.exports = router;
