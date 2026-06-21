const express = require("express");
const { exec } = require("child_process");
const config = require("../config");
const db = require("../db");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "thumbnails",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

const VIDEO_EXTENSIONS = [
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
];

const videoExtensionWhereSql = VIDEO_EXTENSIONS.map(
  () => "LOWER(v.path) LIKE ?"
).join(" OR ");

const videoExtensionParams = VIDEO_EXTENSIONS.map((ext) => `%${ext}`);
const pathVideoExtensionWhereSql = VIDEO_EXTENSIONS.map(
  () => "LOWER(path) LIKE ?"
).join(" OR ");


// query params: ?limit=30&offset=0&category=2&tags=1,5,7
router.get("/", (req, res) => {
  const {
    limit = 30,
    offset = 0,
    category,
    tags,
    favorite,
    includeTotal,
  } = req.query;

  let whereSql = `WHERE v.saved=1`;
  const filterParams = [];

  if (!favorite && category) {
    whereSql += ` AND v.category_id = ?`;
    filterParams.push(category);
  }

  if (tags) {
    const tagIds = tags.split(",").map(Number);
    tagIds.forEach((id) => {
      whereSql += ` AND EXISTS (
        SELECT 1 FROM video_tags vt WHERE vt.video_id = v.id AND vt.tag_id = ?
      )`;
      filterParams.push(id);
    });
  }

  if (favorite === "1") {
    whereSql += ` AND v.favorite = 1`;
  }

  const sql = `
    SELECT
      v.*,
      c.id AS category_id,
      c.display_name AS category_name,
      (SELECT json_group_array(actor_id) FROM video_actors WHERE video_id = v.id) AS actors,
      (SELECT json_group_array(tag_id) FROM video_tags WHERE video_id = v.id) AS tags
    FROM videos v
    LEFT JOIN categories c ON c.id = v.category_id
    ${whereSql}
    ORDER BY date(v.release_date) DESC, v.id DESC
    LIMIT ? OFFSET ?
  `;

  const params = [...filterParams, Number(limit), Number(offset)];

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const videos = rows.map((v) => ({
      ...v,
      actors: JSON.parse(v.actors || "[]"),
      tags: JSON.parse(v.tags || "[]"),
    }));

    if (includeTotal !== "1") {
      res.json(videos);
      return;
    }

    db.get(
      `
      SELECT COUNT(*) AS total
      FROM videos v
      ${whereSql}
      `,
      filterParams,
      (err, countRow) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ videos, total: countRow.total });
      }
    );
  });
});

// return video that should be added
router.get("/new", (req, res) => {
  db.run(
    `
    DELETE FROM videos
    WHERE saved = 0
      AND NOT (${pathVideoExtensionWhereSql})
    `,
    videoExtensionParams,
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      loadNewVideos(res);
    }
  );
});

const loadNewVideos = (res) => {
  const sql = `
    SELECT
      v.*,
      (
        SELECT json_group_array(actor_id)
        FROM video_actors
        WHERE video_id = v.id
      ) AS actors,
      (
        SELECT json_group_array(tag_id)
        FROM video_tags
        WHERE video_id = v.id
      ) AS tags
    FROM videos v
    LEFT JOIN categories c ON c.id = v.category_id
    WHERE v.saved = 0
      AND (${videoExtensionWhereSql})
  `;

  db.all(sql, videoExtensionParams, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(
      rows.map((v) => ({
        ...v,
        actors: JSON.parse(v.actors || "[]"),
        tags: JSON.parse(v.tags || "[]"),
      }))
    );
  });
};

// GET /api/videos/random?limit=50&offset=0
router.get("/random", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT
      v.*,
      (SELECT json_group_array(actor_id) FROM video_actors WHERE video_id = v.id) AS actors,
      (SELECT json_group_array(tag_id) FROM video_tags WHERE video_id = v.id) AS tags
    FROM videos v
    LEFT JOIN categories c ON c.id = v.category_id
    WHERE v.saved = 1
    ORDER BY RANDOM()
    LIMIT ? OFFSET ?
  `;

  db.all(sql, [limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = rows.map((v) => ({
      ...v,
      actors: JSON.parse(v.actors || "[]"),
      tags: JSON.parse(v.tags || "[]"),
    }));

    res.json(result);
  });
});


router.put("/:id", upload.single("thumbnail"), (req, res) => {
  const { id } = req.params;
  const {
    title,
    release_date,
    path: videoPath,
    rating,
    actors,
    tags,
  } = req.body;
  const newThumbnail = req.file ? req.file.filename : null;

  db.get("SELECT thumbnail FROM videos WHERE id=?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const oldThumbnail = row?.thumbnail;
    if (newThumbnail && oldThumbnail) {
      const oldPath = path.join(__dirname, "../thumbnails", oldThumbnail);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    db.run(
      "UPDATE videos SET title=?, release_date=?, path=?, rating=?, thumbnail=?, saved=1 WHERE id=?",
      [
        title,
        release_date,
        videoPath,
        rating,
        newThumbnail || oldThumbnail,
        id,
      ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });


        const actorIds = actors ? JSON.parse(actors) : [];
        const tagIds = tags ? JSON.parse(tags) : [];

        actorIds.forEach((aid) => {
          db.run(
            "INSERT OR IGNORE INTO video_actors (video_id, actor_id) VALUES (?, ?)",
            [id, aid]
          );
        });

        tagIds.forEach((tid) => {
          db.run(
            "INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)",
            [id, tid]
          );
        });

        res.json({ changes: this.changes });
      }
    );
  });
});


router.get("/play/:id", (req, res) => {
  const { id } = req.params;

  console.log("▶ PLAY ROUTE HIT, id =", req.params.id);

  db.get("SELECT path FROM videos WHERE id=?", [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    if (!row) {
      return res.status(404).json({ error: "Video not found" });
    }


    const videoFullPath = path.join(config.VIDEOS_PATH, `${row.path}`);
    console.log("🚀 ~ videoFullPath:", videoFullPath);

    if (!fs.existsSync(videoFullPath)) {
      return res.status(404).json({
        error: "Video file not found on disk",
        path: videoFullPath,
      });
    }

 
    exec(`"${config.VLC_PATH}" "${videoFullPath}"`, (err) => {
      if (err) {
        console.error("VLC exec error:", err);
        return res.status(500).json({ error: "Failed to launch VLC" });
      }
    });

    res.json({
      status: "Playing",
      file: row.path,
    });
  });
});


router.post("/:id/tags", (req, res) => {
  const video_id = req.params.id;
  const { tag_id } = req.body;
  db.run(
    "INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)",
    [video_id, tag_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "Tag added" });
    }
  );
});


router.delete("/:id/tags/:tag_id", (req, res) => {
  const { id: video_id, tag_id } = req.params;
  db.run(
    "DELETE FROM video_tags WHERE video_id=? AND tag_id=?",
    [video_id, tag_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "Tag removed" });
    }
  );
});


router.post("/:id/actors", (req, res) => {
  const video_id = req.params.id;
  const { actor_id } = req.body;
  db.run(
    "INSERT OR IGNORE INTO video_actors (video_id, actor_id) VALUES (?, ?)",
    [video_id, actor_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "Actor added" });
    }
  );
});


router.delete("/:id/actors/:actor_id", (req, res) => {
  const { id: video_id, actor_id } = req.params;
  db.run(
    "DELETE FROM video_actors WHERE video_id=? AND actor_id=?",
    [video_id, actor_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ status: "Actor removed" });
    }
  );
});

router.post("/:id/favorite", (req, res) => {
  const { id } = req.params;
  const { favorite } = req.body;

  if (favorite !== 0 && favorite !== 1) {
    return res.status(400).json({ error: "Favorite must be 0 or 1" });
  }

  db.run(
    "UPDATE videos SET favorite=? WHERE id=?",
    [favorite, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        status: favorite ? "Added to favorites" : "Removed from favorites",
      });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT thumbnail FROM videos WHERE id=?", [id], (err, video) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!video) return res.status(404).json({ error: "Video not found" });

    db.serialize(() => {
      db.run("DELETE FROM video_tags WHERE video_id=?", [id]);
      db.run("DELETE FROM video_actors WHERE video_id=?", [id]);
      db.run("DELETE FROM videos WHERE id=?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        if (video.thumbnail) {
          const thumbnailPath = path.join(config.THUMBNAILS_PATH, video.thumbnail);
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        }

        res.json({ deleted: this.changes });
      });
    });
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT v.*,
      c.id AS category_id,
      c.display_name AS category_name,
      (SELECT json_group_array(actor_id) FROM video_actors WHERE video_id = v.id) AS actors,
      (SELECT json_group_array(tag_id) FROM video_tags WHERE video_id = v.id) AS tags
    FROM videos v
    LEFT JOIN categories c ON c.id = v.category_id
    WHERE v.id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Video not found" });

    res.json({
      ...row,
      actors: JSON.parse(row.actors || "[]"),
      tags: JSON.parse(row.tags || "[]"),
    });
  });
});

module.exports = router;
