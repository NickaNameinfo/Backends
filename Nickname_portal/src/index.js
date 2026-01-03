require("dotenv/config");
const { restRouter } = require("./api");
const config = require("./config");
const appManager = require("./app");
require("./errors");
const scheduler = require("./scheduler");
const path = require("path");
const cors = require("cors");
const db = require("./models");
const { apiRateLimiter } = require("./middleware/rateLimiter");
const { securityValidator } = require("./middleware/securityValidator");
const { startWebSocketServer, stopWebSocketServer } = require("./websocket-server");
global.appRoot = path.resolve(__dirname);
const express = require('express');
// Note: Port 5000 is used by mail server (nicknameinfo.net)
// Update this to your actual port if different
const PORT = process.env.PORT || 8000;
const app = appManager.setup(config);

/*cors handling*/
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options("*", cors());

// Security middleware - Apply globally
// app.use(securityValidator({
//   logThreats: true,
//   blockRequest: true,
//   whitelistFields: ['password', 'token', 'csrfToken'], // Fields that may contain special characters
// }));

// Rate limiting - Apply to all API routes
// app.use("/api", apiRateLimiter);

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

/* Route handling */
app.use("/api", restRouter);
// app.use('/', webRouter);

app.use((req, res, next) => {
  next(new RequestError("Invalid route", 404));
});

app.use((error, req, res, next) => {
  if (!(error instanceof RequestError)) {
    error = new RequestError("Some Error Occurred", 500, error.message);
  }
  error.status = error.status || 500;
  res.status(error.status);
  
  // Always return JSON for API endpoints
  return res.json({ 
    success: false,
    errors: error.errorList || [error.message || "An error occurred"],
    status: error.status
  });
});

/* Start Listening service */
const server = app.listen(PORT, () => {
  console.log(`Server is running at PORT http://localhost:${PORT}`);
});

// Start WebSocket server on port 3001 (separate server)
// This matches your existing Nginx configuration
try {
  startWebSocketServer();
  console.log('[WebSocket] Server started on port 3001');
  console.log('[WebSocket] Nginx should proxy /socket.io/ to http://localhost:3001');
} catch (error) {
  console.error('[WebSocket] Failed to start WebSocket server:', error);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    stopWebSocketServer().then(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    stopWebSocketServer().then(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
