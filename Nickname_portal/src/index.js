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
const { Server } = require('socket.io');
const { setupSocketIO } = require("./websocket-server");
global.appRoot = path.resolve(__dirname);
const express = require('express');
const PORT = 5000;
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

// Initialize Socket.IO on the same server (integrated approach)
// This allows WebSocket to work through the same Nginx proxy on port 5000
const io = new Server(server, {
  cors: {
    origin: [
      'https://admin.nicknameportal.shop',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Setup WebSocket handlers for barcode scanning
try {
  setupSocketIO(io);
  console.log('[WebSocket] Integrated on main server (port 5000)');
  console.log('[WebSocket] Connect to: https://admin.nicknameportal.shop/socket.io');
} catch (error) {
  console.error('[WebSocket] Failed to setup:', error);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  io.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  io.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
