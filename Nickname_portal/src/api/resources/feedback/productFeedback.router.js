const express = require("express");
const productFeedbackController = require("./productFeedback.controller");
const { sanitize } = require("../../../middleware/sanitizer");

const productFeedbackRouter = express.Router();

// Create new product feedback
productFeedbackRouter
  .route("/create")
  .post(sanitize(), productFeedbackController.addProductFeedback);

// Get all product feedback
productFeedbackRouter
  .route("/list")
  .get(sanitize(), productFeedbackController.getProductFeedback);

// Get product feedback by productId
productFeedbackRouter
  .route("/list/:id")
  .get(sanitize(), productFeedbackController.getProductFeedbackById);

// Update product feedback
productFeedbackRouter
  .route("/update")
  .post(sanitize(), productFeedbackController.updateProductFeedback);

// Delete product feedback
productFeedbackRouter
  .route("/delete/:id")
  .delete(sanitize(), productFeedbackController.deleteProductFeedback);

module.exports = { productFeedbackRouter };
