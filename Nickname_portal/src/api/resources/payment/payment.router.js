const express = require("express");
const paymentController = require("./payment.controller");
const { sanitize } = require("../../../middleware/sanitizer");
const { jwtStrategy } = require("../../../middleware/strategy");

const paymentRouter = express.Router();
paymentRouter.route("/orders").post(sanitize(), paymentController.orderDetails);
paymentRouter
  .route("/orderlist")
  .post(sanitize(), paymentController.findOrderList);
paymentRouter
  .route("/getAllPayment")
  .get(sanitize(), jwtStrategy, paymentController.getAllPayment);

module.exports = { paymentRouter };
