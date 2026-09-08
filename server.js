const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

// ===============================
// FOLDERS
// ===============================

const publicFolder = path.join(__dirname, "public");
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Uploaded videos
app.use("/uploads", express.static(uploadFolder));

// Website
app.use(express.static(publicFolder));

// ===============================
// MULTER STORAGE
// ===============================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const safeName =
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 10) +
      ext;

    cb(null, safeName);
  }
});

// ===============================
// VIDEO UPLOAD
// ===============================

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 300 * 1024 * 1024
  },

  fileFilter: function (req, file, cb) {

    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-matroska"
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [
      ".mp4",
      ".mov",
      ".webm",
      ".mkv"
    ];

    if (
      allowedTypes.includes(file.mimetype) ||
      allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only MP4, MOV, WEBM and MKV videos are allowed."));
    }
  }
});

// ===============================
// POSTS MEMORY
// ===============================

let posts = [];

// ===============================
// HOME
// ===============================

app.get("/", function (req, res) {
  res.sendFile(path.join(publicFolder, "index.html"));
});

// ===============================
// TEST API
// ===============================

app.get("/api/test", function (req, res) {
  res.json({
    success: true,
    message: "X-DARK API is working 🚀"
  });
});

// ===============================
// GET POSTS
// ===============================

app.get("/api/posts", function (req, res) {
  res.json({
    success: true,
    posts: posts
  });
});

// ===============================
// UPLOAD VIDEO
// ===============================

app.post(
  "/api/upload",
  function (req, res, next) {

    console.log("================================");
    console.log("UPLOAD REQUEST RECEIVED");
    console.log("================================");

    next();
  },

  upload.single("video"),

  function (req, res) {

    console.log("VIDEO UPLOAD FINISHED");

    if (!req.file) {

      console.log("NO VIDEO FILE RECEIVED");

      return res.status(400).json({
        success: false,
        message: "No video file received."
      });
    }

    console.log("Original:", req.file.originalname);
    console.log("Saved:", req.file.filename);
    console.log("Size:", req.file.size);

    const caption = req.body.caption || "";
    const tags = req.body.tags || "";

    const post = {
      id: Date.now().toString(),

      username: "X-Dark User",

      handle: "@Darkwing2",

      caption: caption,

      tags: tags,

      video:
        "/uploads/" +
        encodeURIComponent(req.file.filename),

      filename: req.file.filename,

      originalName: req.file.originalname,

      size: req.file.size,

      createdAt: new Date().toISOString(),

      likes: 0,

      comments: 0
    };

    posts.unshift(post);

    console.log("POST CREATED:", post);

    return res.status(201).json({
      success: true,

      message: "Video uploaded successfully 🎬",

      post: post
    });
  }
);

// ===============================
// DELETE POST
// ===============================

app.delete("/api/posts/:id", function (req, res) {

  const id = req.params.id;

  const postIndex = posts.findIndex(
    post => post.id === id
  );

  if (postIndex === -1) {

    return res.status(404).json({
      success: false,
      message: "Post not found."
    });
  }

  const post = posts[postIndex];

  // Delete video file
  if (post.filename) {

    const filePath =
      path.join(uploadFolder, post.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  posts.splice(postIndex, 1);

  res.json({
    success: true,
    message: "Post deleted."
  });
});

// ===============================
// MULTER / UPLOAD ERROR
// ===============================

app.use(function (err, req, res, next) {

  console.error("UPLOAD ERROR:");
  console.error(err);

  if (err instanceof multer.MulterError) {

    if (err.code === "LIMIT_FILE_SIZE") {

      return res.status(413).json({
        success: false,
        message: "Video is too large. Maximum size is 300 MB."
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || "Upload failed."
  });
});

// ===============================
// 404
// ===============================

app.use(function (req, res) {

  if (req.path.startsWith("/api/")) {

    return res.status(404).json({
      success: false,
      message: "API route not found."
    });
  }

  res.status(404).send("X-DARK page not found");
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", function () {

  console.log("================================");
  console.log("🔥 X-DARK SERVER STARTED");
  console.log("PORT:", PORT);
  console.log("================================");

});
