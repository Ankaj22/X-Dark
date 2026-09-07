const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* Body parser */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "5mb"
}));

/* Security headers */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  next();
});

/* Static files */
app.use(express.static(__dirname));

/* API status */
app.get("/api/status", (req, res) => {
  res.json({
    app: "X-Dark",
    version: "2.0.0",
    status: "online",
    serverTime: new Date().toISOString()
  });
});

/* Health check */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "X-Dark"
  });
});

/* App configuration */
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
      following: true,
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

/* API 404 */
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found"
  });
});

/*
  Express 5 compatible frontend fallback.
  This catches all non-API routes.
*/
app.get("/{*splat}", (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});

/* Error handler */
app.use((err, req, res, next) => {
  console.error("X-Dark Error:", err);

  res.status(500).json({
    error: "Internal server error"
  });
});

/* Start */
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `X-Dark running on port ${PORT}`
  );
});
