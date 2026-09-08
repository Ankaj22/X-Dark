const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, "public");
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename =
      Date.now() + "-" +
      Math.random().toString(36).substring(2) +
      ext;

    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 500 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowed = [
      "video/mp4",
      "video/quicktime",
      "video/webm"
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only MP4, MOV and WEBM videos are allowed."));
    }
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Uploaded videos */
app.use("/uploads", express.static(uploadDir));

/* Website files */
app.use(express.static(publicDir));

/* HOME */
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

/* POSTS */
let posts = [];

app.get("/api/posts", (req, res) => {
  res.json(posts);
});

/* VIDEO UPLOAD */
app.post("/api/upload", upload.single("video"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      message: "No video selected."
    });
  }

  const post = {
    id: Date.now().toString(),

    username: "X-Dark User",

    handle: "@Darkwing2",

    caption:
      req.body.caption ||
      "My new X-DARK video 🚀",

    tags:
      req.body.tags || "",

    video:
      "/uploads/" + req.file.filename,

    filename:
      req.file.originalname,

    createdAt:
      new Date().toISOString()
  };

  posts.unshift(post);

  res.json({
    success: true,
    message: "Video uploaded successfully",
    post: post
  });
});

/* ERROR */
app.use((err, req, res, next) => {

  console.error(err);

  res.status(400).json({
    message: err.message || "Something went wrong"
  });

});

app.listen(PORT, () => {
  console.log(`X-DARK running on port ${PORT}`);
});
