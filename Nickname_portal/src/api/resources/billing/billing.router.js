const express = require("express");
const billingController = require("./billing.controller");
const { sanitize } = require("../../../middleware/sanitizer");

const billingRouter = express.Router();

billingRouter.route("/add").post(billingController.addBill);
billingRouter.route("/update").post(billingController.updateBill);
billingRouter.route("/getAll").get(billingController.getBills);
billingRouter.route("/getById/:id").get(billingController.getBillById);
billingRouter.route("/getByStoreId/:storeId").get(billingController.getBillByStoreId);

module.exports = { billingRouter };

