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
productRouter.route("/getAllproduct").get(productController.index);
productRouter
  .route("/getAllproductList")
  .get(productController.getAllProductList);
productRouter
  .route("/getProductsByOpenStores")
  .get(productController.getProductsByOpenStores);
productRouter
  .route("/update")
  .post(productController.update);
productRouter
  .route("/getProductByCategory")
  .get(productController.getProductListByCategory);
productRouter
  .route("/getProductById/:id")
  .get(productController.getProductListById);
productRouter
  .route("/getWebProductById/:id")
  .get(productController.getWebProductListById);
productRouter
  .route("/product-offer")
  .post(productController.addProductOffer);
productRouter
  .route("/getAllProductOffer")
  .get(productController.getProductOffer);
productRouter
  .route("/delete")
  .delete(productController.productDelete);
productRouter
  .route("/deleteOfferById/:id")
  .get(productController.productOfferDelete);
// productRouter.route('/upload-img').post(upload.array('file', 10), productController.multiplePhotoUpload);
productRouter
  .route("/getAllPhoto")
  .get(productController.getAllPhoto);
productRouter
  .route("/slider-photo/delete")
  .delete(productController.deleteSliderPhoto);

//Category by product
productRouter
  .route("/getAllGroceryStaple")
  .get(productController.getAllGrocerryStaples);
productRouter
  .route("/list/:slug")
  .get(productController.getAllProductBySlug);
productRouter
  .route("/getAllByCategory")
  .get(productController.GetAllByCategories);
productRouter
  .route("/getallProductbySubChildCat")
  .post(productController.getProductSubChildCat);

// Filter product
productRouter
  .route("/gcatalogsearch/result")
  .get(productController.getFilterbyProduct);

//new api
productRouter
  .route("/search_product")
  .post(productController.searchProductBySubCat);

//aws image delete
productRouter
  .route("/aws/delete/photo")
  .post(productController.awsProductPhotoDelete);

module.exports = { productRouter };
