const express = require("express");
const orderController = require("./order.controller");
const { sanitize } = require("../../../middleware/sanitizer");

const orderRouter = express.Router();

orderRouter.route("/create").post(sanitize(), orderController.index);
orderRouter.route("/list").get(sanitize(), orderController.getAllOrderList);
orderRouter
  .route("/status/update")
  .post(sanitize(), orderController.statusUpdate);
orderRouter
  .route("/list/:id")
  .get(sanitize(), orderController.getAllOrderListById); 
  orderRouter
  .route("/store/list/:id")
  .get(sanitize(), orderController.getAllOrderListBySoreId); 
orderRouter
  .route("/status")
  .post(sanitize(), orderController.getAllOrderStatus);
orderRouter.route("/count").get(sanitize(), orderController.getAllOrderCount);
module.exports = { orderRouter };
