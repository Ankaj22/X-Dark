const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

/* -----------------------------
   BASIC MIDDLEWARE
----------------------------- */

app.use(express.json({
  limit: "5mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "5mb"
}));

/* -----------------------------
   STATIC WEBSITE
----------------------------- */

app.use(
  express.static(__dirname)
);

/* -----------------------------
   API STATUS
----------------------------- */

app.get("/api/status", (req, res) => {

  res.json({
    app: "X-Dark",
    version: "2.0.0",
    status: "online",
    serverTime: new Date().toISOString()
  });

});

/* -----------------------------
   HEALTH CHECK
----------------------------- */

app.get("/health", (req, res) => {

  res.status(200).json({
    status: "ok"
  });

});

/* -----------------------------
   APP CONFIG
----------------------------- */

app.get("/api/config", (req, res) => {

  res.json({
    appName: "X-Dark",
    maxVideoSizeMB: 100,
    features: {
      feed: true,
      reels: true,
      upload: true,
      likes: true,
      comments: true,
      profiles: true,
      followers: true,
      search: true,
      notifications: true,
      saved: true,
      stories: true,
      messages: true,
      reports: true,
      admin: true
    }
  });

});

/* -----------------------------
   SECURITY HEADERS
----------------------------- */

app.use((req, res, next) => {

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-Frame-Options",
    "SAMEORIGIN"
  );

  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  next();

});

/* -----------------------------
   404 API HANDLER
----------------------------- */

app.use("/api", (req, res) => {

  res.status(404).json({
    error: "API endpoint not found"
  });

});

/* -----------------------------
   FRONTEND FALLBACK
----------------------------- */

app.get("*", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "index.html"
    )
  );

});

/* -----------------------------
   ERROR HANDLER
----------------------------- */

app.use((err, req, res, next) => {

  console.error(
    "X-Dark Error:",
    err
  );

  res.status(500).json({
    error: "Internal server error"
  });

});

/* -----------------------------
   START SERVER
----------------------------- */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `X-Dark server running on port ${PORT}`
    );

  }
);
