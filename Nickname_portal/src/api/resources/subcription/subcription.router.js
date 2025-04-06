const express = require("express");
const subscriptionController = require("./subcription.controller");
const { sanitize } = require("../../../middleware/sanitizer");

const subscriptionRouter = express.Router();

// Get all subscriptions
subscriptionRouter.route("/").get(sanitize(), subscriptionController.getAllSubscriptions);

// Get subscription by ID
subscriptionRouter.route("/:id").get(sanitize(), subscriptionController.getSubscriptionById);

// Add new subscription
subscriptionRouter.route("/create").post(sanitize(), subscriptionController.addSubscription);

// Update subscription
subscriptionRouter.route("/update").post(sanitize(), subscriptionController.updateSubscription);

// Delete subscription
subscriptionRouter.route("/delete/:id").delete(sanitize(), subscriptionController.deleteSubscription);

module.exports = { subscriptionRouter };
