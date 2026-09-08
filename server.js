const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

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
    const name =
      Date.now() + "-" +
      Math.random().toString(36).slice(2) +
      ext;

    cb(null, name);
  }
});

const upload = multer({
  storage,

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

app.use("/uploads", express.static(uploadDir));

app.use(express.static(path.join(__dirname, "public")));

let posts = [];

app.get("/api/posts", (req, res) => {
  res.json(posts);
});

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
    message: "Video uploaded successfully.",
    post
  });
});

app.delete("/api/posts/:id", (req, res) => {

  const index =
    posts.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: "Post not found."
    });
  }

  const post = posts[index];

  const filePath =
    path.join(
      uploadDir,
      path.basename(post.video)
    );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  posts.splice(index, 1);

  res.json({
    success: true
  });
});

app.use((err, req, res, next) => {

  console.error(err);

  res.status(400).json({
    message:
      err.message || "Upload failed."
  });
});

app.listen(PORT, () => {

  console.log(
    `X-DARK running on port ${PORT}`
  );

});
