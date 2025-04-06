const express = require("express");
// const multer = require('multer');
// const path = require('path');
const vendorController = require("./vendor.controller");
const { sanitize } = require("../../../middleware/sanitizer");
const { jwtStrategy } = require("../../../middleware/strategy");
const { validateBody, schemas } = require("../../../middleware/validator");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

const vendorRouter = express.Router();
vendorRouter
  .route("/create")
  .post(upload.single("vendorImage"), vendorController.index);
vendorRouter.route("/list").get(sanitize(), vendorController.getAllvendor);
vendorRouter
  .route("/list/:id")
  .get(sanitize(), vendorController.getVendorStockById);
vendorRouter
  .route("/product-list")
  .get(sanitize(), vendorController.getAllVendorProduct);
vendorRouter
  .route("/product/getAllProductById/:id")
  .get(sanitize(), vendorController.getProductByVendor);
vendorRouter
  .route("/update")
  .post(upload.single("vendorImage"), vendorController.vendorUpdate);
vendorRouter
  .route("/delete/:id")
  .delete(sanitize(), vendorController.vendorDelete);
vendorRouter
  .route("/product-delete")
  .post(sanitize(), vendorController.vendorProductDelete);
vendorRouter.route("/product-add").post(vendorController.vendorAddProduct);
// vendorRouter.route("/wordtojson").post(upload.single("vendorImage"), vendorController.extractClustersFromDocx);

module.exports = { vendorRouter };
