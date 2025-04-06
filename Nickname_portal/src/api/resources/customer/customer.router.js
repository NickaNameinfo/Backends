const express = require("express");
const customerController = require("./customer.controller");
const { sanitize } = require("../../../middleware/sanitizer");
const { customerStrategy } = require("../../../middleware/strategy");
const { validateBody, schemas } = require("../../../middleware/validator");

const customerRouter = express.Router();

customerRouter.route("/register").post(sanitize(), customerController.addUser);
customerRouter
  .route("/getUserByEmailId")
  .get(sanitize(), customerController.findUser);
customerRouter
  .route("/login")
  .post(
    sanitize(),
    validateBody(schemas.loginSchema),
    customerStrategy,
    customerController.login
  );

// Get all customers
customerRouter
  .route("/list")
  .get(sanitize(), customerController.getAllCustomer);
customerRouter
  .route("/update")
  .post(sanitize(), customerController.getCustomerUpdate);
customerRouter
  .route("/delete")
  .delete(sanitize(), customerController.deleteCustomer);

module.exports = { customerRouter };
