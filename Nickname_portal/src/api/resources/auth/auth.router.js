const express = require('express');
const authController = require('./auth.controller');
const { localStrategy , jwtStrategy} = require('../../../middleware/strategy');
const { sanitize } = require('../../../middleware/sanitizer');
const { validateBody, schemas } = require('../../../middleware/validator');
const multer = require("multer");
const path = require("path"); // Ensure path is imported if not already

// Change storage to memoryStorage
const storage = multer.memoryStorage();
  
const upload = multer({ storage: storage });

const authRouter = express.Router();
authRouter.route('/register').post(sanitize(),/* validateBody(schemas.registerSchema), */ authController.addUser);
authRouter.route('/user/getAllUserList').get(sanitize(),  authController.getAllUserList);
authRouter.route('/user/update').post(sanitize(), authController.userUpdate);
authRouter.route('/user/delete').post(sanitize(), jwtStrategy, authController.deleteUserList);
authRouter.route('/user/:id').get(sanitize(), authController.findUser);
authRouter.route('/rootLogin').post(sanitize(),validateBody(schemas.loginSchema),localStrategy, authController.login);
authRouter.route('/upload-file').post(upload.single("file"), authController.uploadFileController);

module.exports = { authRouter };
