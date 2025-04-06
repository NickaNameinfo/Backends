const express = require('express');
// const multer = require('multer');
// const path = require('path');
const storeController = require('./store.controller');
const { sanitize } = require('../../../middleware/sanitizer');
const { jwtStrategy } = require('../../../middleware/strategy');
const { validateBody, schemas } = require('../../../middleware/validator');
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


const storeRouter = express.Router();
// storeRouter.route('/create').post(sanitize(),validateBody(schemas.storeDetails),storeController.index);
storeRouter.route('/create').post(upload.single("storeImage"),storeController.index);
storeRouter.route('/list').get(sanitize(), storeController.getAllstore);
storeRouter.route('/list/:id').get(sanitize(), storeController.getstoreById);
storeRouter.route('/product-list').get(sanitize(), storeController.getAllstoreProduct);
storeRouter.route('/product/getAllProductById/:id').get(sanitize(), storeController.getProductBystore);
storeRouter.route('/update').post(upload.single("storeImage"), storeController.storeUpdate);
storeRouter.route('/delete/:id').delete(sanitize(), storeController.storeDelete);
storeRouter.route('/product-delete').post(sanitize(), storeController.storeProductDelete);
storeRouter.route('/product-add').post(storeController.storeAddProduct);
storeRouter.route('/filterByCategory').get(storeController.getAllStoresByCategories);
storeRouter.route('/getAllStoresByFilters').get(storeController.getAllStoresByFilters);
storeRouter.route('/getOpenStores').get(storeController.getOpenStores);
module.exports = { storeRouter };
