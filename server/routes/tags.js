const express = require("express");
const db = require("../db");
const router = express.Router();


router.get("/", (req, res) => {
  db.all("SELECT * FROM tags", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


router.post("/", (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO tags (name) VALUES (?)", [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});


router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.run("UPDATE tags SET name=? WHERE id=?", [name, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});


router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tags WHERE id=?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
