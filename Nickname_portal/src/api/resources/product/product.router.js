const express = require("express");
const productController = require("./product.controller");
const { sanitize } = require("../../../middleware/sanitizer");
const { jwtStrategy } = require("../../../middleware/strategy");
// const upload = require('../../../awsbucket');
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

const productRouter = express.Router();
productRouter
  .route("/add")
  .post(
    // sanitize(),
    // jwtStrategy,
    productController.addProduct
  );
productRouter.route("/getAllproduct").get(sanitize(), productController.index);
productRouter
  .route("/getAllproductList")
  .get(sanitize(), productController.getAllProductList);
productRouter
  .route("/getProductsByOpenStores")
  .get(sanitize(), productController.getProductsByOpenStores);
productRouter
  .route("/update")
  .post(sanitize(), productController.update);
productRouter
  .route("/getProductByCategory")
  .get(sanitize(), productController.getProductListByCategory);
productRouter
  .route("/getProductById/:id")
  .get(sanitize(), productController.getProductListById);
productRouter
  .route("/getWebProductById/:id")
  .get(sanitize(), productController.getWebProductListById);
productRouter
  .route("/product-offer")
  .post(sanitize(), productController.addProductOffer);
productRouter
  .route("/getAllProductOffer")
  .get(sanitize(), productController.getProductOffer);
productRouter
  .route("/delete")
  .delete(sanitize(), productController.productDelete);
productRouter
  .route("/deleteOfferById/:id")
  .get(sanitize(), productController.productOfferDelete);
// productRouter.route('/upload-img').post(sanitize(), upload.array('file', 10), productController.multiplePhotoUpload);
productRouter
  .route("/getAllPhoto")
  .get(sanitize(), productController.getAllPhoto);
productRouter
  .route("/slider-photo/delete")
  .delete(sanitize(), productController.deleteSliderPhoto);

//Category by product
productRouter
  .route("/getAllGroceryStaple")
  .get(sanitize(), productController.getAllGrocerryStaples);
productRouter
  .route("/list/:slug")
  .get(sanitize(), productController.getAllProductBySlug);
productRouter
  .route("/getAllByCategory")
  .get(sanitize(), productController.GetAllByCategories);
productRouter
  .route("/getallProductbySubChildCat")
  .post(sanitize(), productController.getProductSubChildCat);

// Filter product
productRouter
  .route("/gcatalogsearch/result")
  .get(sanitize(), productController.getFilterbyProduct);

//new api
productRouter
  .route("/search_product")
  .post(productController.searchProductBySubCat);

//aws image delete
productRouter
  .route("/aws/delete/photo")
  .post(sanitize(), productController.awsProductPhotoDelete);

module.exports = { productRouter };
