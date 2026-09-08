const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================
   FOLDERS
========================= */

const publicFolder = path.join(__dirname, "public");
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true
  });
}


/* =========================
   EXPRESS
========================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


/* =========================
   STATIC FILES
========================= */

app.use(
  "/uploads",
  express.static(uploadFolder)
);

app.use(
  express.static(publicFolder)
);


/* =========================
   MULTER STORAGE
========================= */

const storage = multer.diskStorage({

  destination: function(req, file, cb) {

    cb(null, uploadFolder);

  },

  filename: function(req, file, cb) {

    const extension =
      path.extname(file.originalname);

    const filename =
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 10) +
      extension;

    cb(null, filename);

  }

});


const upload = multer({

  storage: storage,

  limits: {

    fileSize:
      300 * 1024 * 1024

  },

  fileFilter: function(req, file, cb) {

    const allowedTypes = [

      "video/mp4",

      "video/quicktime",

      "video/webm"

    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {

      cb(null, true);

    }

    else {

      cb(
        new Error(
          "Only MP4, MOV and WEBM videos are allowed."
        )
      );

    }

  }

});


/* =========================
   POSTS DATABASE TEMP
========================= */

let posts = [];


/* =========================
   HOME
========================= */

app.get("/", function(req, res) {

  res.sendFile(
    path.join(
      publicFolder,
      "index.html"
    )
  );

});


/* =========================
   GET POSTS
========================= */

app.get(
  "/api/posts",
  function(req, res) {

    res.json(posts);

  }
);


/* =========================
   UPLOAD VIDEO
========================= */

app.post(
  "/api/upload",

  upload.single("video"),

  function(req, res) {

    if (!req.file) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Please select a video."

        });

    }


    const newPost = {

      id:
        Date.now().toString(),

      username:
        "X-Dark User",

      handle:
        "@Darkwing2",

      caption:
        req.body.caption ||
        "New X-DARK video 🚀",

      tags:
        req.body.tags || "",

      video:
        "/uploads/" +
        req.file.filename,

      createdAt:
        new Date().toISOString()

    };


    posts.unshift(newPost);


    res.json({

      success: true,

      message:
        "Video uploaded successfully.",

      post: newPost

    });

  }
);


/* =========================
   DELETE POST
========================= */

app.delete(
  "/api/posts/:id",

  function(req, res) {

    const postIndex =
      posts.findIndex(
        post =>
          post.id ===
          req.params.id
      );


    if (postIndex === -1) {

      return res
        .status(404)
        .json({

          message:
            "Post not found."

        });

    }


    const post =
      posts[postIndex];


    const filename =
      path.basename(
        post.video
      );


    const filePath =
      path.join(
        uploadFolder,
        filename
      );


    if (
      fs.existsSync(filePath)
    ) {

      fs.unlinkSync(filePath);

    }


    posts.splice(
      postIndex,
      1
    );


    res.json({

      success: true

    });

  }
);


/* =========================
   ERROR HANDLER
========================= */

app.use(
  function(
    error,
    req,
    res,
    next
  ) {

    console.error(error);


    res
      .status(400)
      .json({

        success: false,

        message:
          error.message ||
          "Something went wrong."

      });

  }
);


/* =========================
   SERVER START
========================= */

app.listen(
  PORT,
  function() {

    console.log(
      "X-DARK running on port " +
      PORT
    );

  }
);
