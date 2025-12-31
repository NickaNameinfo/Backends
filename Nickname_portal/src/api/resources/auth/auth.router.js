const express = require('express');
const authController = require('./auth.controller');
const { localStrategy , jwtStrategy} = require('../../../middleware/strategy');
const { sanitize } = require('../../../middleware/sanitizer');
const { validateBody, schemas } = require('../../../middleware/validator');
const { authRateLimiter, strictRateLimiter } = require('../../../middleware/rateLimiter');
const { validateFileUpload } = require('../../../middleware/securityValidator');
const { requireAdmin } = require('../../../middleware/requireAuth');
const multer = require("multer");
const path = require("path"); // Ensure path is imported if not already

// Change storage to memoryStorage
const storage = multer.memoryStorage();
  
const upload = multer({ storage: storage });

const authRouter = express.Router();

// Apply strict rate limiting to authentication endpoints
authRouter.route('/register').post(
  strictRateLimiter, // 3 attempts per hour
  sanitize(),
  /* validateBody(schemas.registerSchema), */ 
  authController.addUser
);

authRouter.route('/user/getAllUserList').get(sanitize(), jwtStrategy, requireAdmin, authController.getAllUserList);
authRouter.route('/user/update').post(sanitize(), jwtStrategy, authController.userUpdate);
authRouter.route('/user/delete').post(sanitize(), jwtStrategy, requireAdmin, authController.deleteUserList);
authRouter.route('/user/:id').get(sanitize(), jwtStrategy, authController.findUser);

// Apply auth rate limiting to login (5 attempts per 15 minutes)
authRouter.route('/rootLogin').post(
  authRateLimiter,
  sanitize(),
  validateBody(schemas.loginSchema),
  localStrategy, 
  authController.login
);

// Apply file validation to upload endpoint
authRouter.route('/upload-file').post(
  upload.single("file"), 
  validateFileUpload,
  authController.uploadFileController
);

module.exports = { authRouter };
