const express = require('express');
// const multer = require('multer');
// const path = require('path');
const storeController = require('./store.controller');
const { sanitize } = require('../../../middleware/sanitizer');
const { jwtStrategy } = require('../../../middleware/strategy');
const { validateBody, schemas } = require('../../../middleware/validator');
const { requireAdmin } = require('../../../middleware/requireAuth');
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
storeRouter.route('/create').post(jwtStrategy, storeController.index);
storeRouter.route('/list').get(sanitize(), storeController.getAllstore);
storeRouter.route('/service/list').get(sanitize(), storeController.getServiceAllstore);
storeRouter.route('/admin/list').get(sanitize(), jwtStrategy, requireAdmin, storeController.adminGetAllstore);
storeRouter.route('/list/:id').get(sanitize(), storeController.getstoreById);
storeRouter.route('/product-list').get(sanitize(), storeController.getAllstoreProduct);
storeRouter.route('/product/getAllProductById/:id').get(sanitize(), storeController.getProductBystore);
storeRouter.route('/product/admin/getAllProductById/:id').get(sanitize(), jwtStrategy, storeController.getAdminProductBystore);
storeRouter.route('/update').post(jwtStrategy, requireAdmin, storeController.storeUpdate);
storeRouter.route('/delete/:id').delete(sanitize(), jwtStrategy, requireAdmin, storeController.storeDelete);
storeRouter.route('/product-delete').post(sanitize(), jwtStrategy, storeController.storeProductDelete);
storeRouter.route('/product-add').post(jwtStrategy, storeController.storeAddProduct);
storeRouter.route('/filterByCategory').get(storeController.getAllStoresByCategories);
storeRouter.route('/service/filterByCategory').get(storeController.getServiceAllStoresByCategories);
storeRouter.route('/getAllStoresByFilters').get(storeController.getAllStoresByFilters);
storeRouter.route('/service/getAllStoresByFilters').get(storeController.getServiceAllStoresByFilters);
storeRouter.route('/getOpenStores').get(storeController.getOpenStores);
module.exports = { storeRouter };
