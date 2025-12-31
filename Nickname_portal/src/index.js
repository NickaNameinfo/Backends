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
app.use(securityValidator({
  logThreats: true,
  blockRequest: true,
  whitelistFields: ['password', 'token', 'csrfToken'], // Fields that may contain special characters
}));

// Rate limiting - Apply to all API routes
app.use("/api", apiRateLimiter);

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
app.listen(PORT, () => {
  console.log(`Server is running at PORT http://localhost:${PORT}`);
});
