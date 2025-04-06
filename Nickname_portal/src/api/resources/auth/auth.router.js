const express = require('express');
const authController = require('./auth.controller');
const { localStrategy , jwtStrategy} = require('../../../middleware/strategy');
const { sanitize } = require('../../../middleware/sanitizer');
const { validateBody, schemas } = require('../../../middleware/validator');

const authRouter = express.Router();
authRouter.route('/register').post(sanitize(),/* validateBody(schemas.registerSchema), */ authController.addUser);
authRouter.route('/user/getAllUserList').get(sanitize(),  authController.getAllUserList);
authRouter.route('/user/update').post(sanitize(), authController.userUpdate);
authRouter.route('/user/delete').post(sanitize(), jwtStrategy, authController.deleteUserList);
authRouter.route('/user/:id').get(sanitize(), authController.findUser);
authRouter.route('/rootLogin').post(sanitize(),validateBody(schemas.loginSchema),localStrategy, authController.login);

module.exports = { authRouter };
