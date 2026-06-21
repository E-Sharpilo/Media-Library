const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  db.all("SELECT * FROM categories ORDER BY display_name COLLATE NOCASE", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { display_name } = req.body;
  db.run(
    "UPDATE categories SET display_name=? WHERE id=?",
    [display_name, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ changes: this.changes });
    }
  );
});

module.exports = router;
