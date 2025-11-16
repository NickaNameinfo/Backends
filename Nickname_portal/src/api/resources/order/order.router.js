const express = require("express");
const orderController = require("./order.controller");
const { sanitize } = require("../../../middleware/sanitizer");

const orderRouter = express.Router();

orderRouter.route("/create").post(orderController.index);
orderRouter.route("/list").get(orderController.getAllOrderList);
orderRouter
  .route("/status/update")
  .post(orderController.statusUpdate);
orderRouter
  .route("/list/:id")
  .get(orderController.getAllOrderListById); 
  orderRouter
  .route("/store/list/:id")
  .get(orderController.getAllOrderListBySoreId); 
orderRouter
  .route("/status")
  .post(orderController.getAllOrderStatus);
orderRouter.route("/count").get(orderController.getAllOrderCount);
module.exports = { orderRouter };
