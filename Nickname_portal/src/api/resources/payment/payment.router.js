const express = require("express");
const paymentController = require("./payment.controller");
const { sanitize } = require("../../../middleware/sanitizer");
const { jwtStrategy } = require("../../../middleware/strategy");

const paymentRouter = express.Router();
paymentRouter.route("/orders").post(paymentController.orderDetails);
paymentRouter
  .route("/orderlist")
  .post(paymentController.findOrderList);
paymentRouter
  .route("/getAllPayment")
  .get(jwtStrategy, paymentController.getAllPayment);

module.exports = { paymentRouter };
