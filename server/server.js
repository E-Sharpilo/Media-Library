const express = require("express");
const config = require("./config");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(config.UI_PATH));

app.use("/api/videos", require("./routes/videos"));
app.use("/api/tags", require("./routes/tags"));
app.use("/api/actors", require("./routes/actors"));
app.use("/api/sync", require("./routes/sync"));
app.use("/api/categories", require("./routes/categories"));

const staticImageOptions = {
  maxAge: "30d",
  immutable: true,
  etag: true,
  lastModified: true,
};

app.use(
  "/actors_photos",
  express.static(config.ACTORS_PHOTOS_PATH, staticImageOptions)
);
app.use(
  "/thumbnails",
  express.static(config.THUMBNAILS_PATH, staticImageOptions)
);

app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(config.UI_PATH, "index.html"));
  } else {
    next();
  }
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
