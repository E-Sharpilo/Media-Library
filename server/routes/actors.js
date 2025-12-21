const express = require("express");
const db = require("../db");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: "actors_photos",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// get actors
router.get("/", (req, res) => {
  db.all("SELECT * FROM actors", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", upload.single("photo"), (req, res) => {
  const { name, description } = req.body;
  const photo = req.file ? req.file.filename : null;

  db.run(
    "INSERT INTO actors (name, photo, description) VALUES (?, ?, ?)",
    [name, photo, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: this.lastID,
        name,
        photo,
        description,
      });
    }
  );
});

// change actors data
router.put("/:id", upload.single("photo"), (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const newPhoto = req.file ? req.file.filename : null;

  db.get("SELECT photo FROM actors WHERE id = ?", [id], (err, actor) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!actor) return res.status(404).json({ error: "Actor not found" });

    if (newPhoto && actor.photo) {
      const oldPath = path.join("actors_photos", actor.photo);
      fs.existsSync(oldPath) && fs.unlinkSync(oldPath);
    }

    db.run(
      `
      UPDATE actors 
      SET name = ?, description = ?, photo = ?
      WHERE id = ?
      `,
      [name, description, newPhoto ? newPhoto : actor.photo, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });
});

// delete actor
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT photo FROM actors WHERE id = ?", [id], (err, actor) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!actor) return res.status(404).json({ error: "Actor not found" });

    if (actor.photo) {
      const photoPath = path.join("actors_photos", actor.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    db.run("DELETE FROM actors WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ deleted: true });
    });
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM actors WHERE id=?", [id], (err, actor) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!actor) return res.status(404).json({ error: "Actor not found" });

    const sql = `
      SELECT
        v.*,
        c.display_name AS category_name
      FROM videos v
      JOIN video_actors va ON va.video_id = v.id
      LEFT JOIN categories c ON c.id = v.category_id
      WHERE va.actor_id = ?
        AND v.saved = 1
    `;

    db.all(sql, [id], (err, videos) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ actor, videos });
    });
  });
});

module.exports = router;
