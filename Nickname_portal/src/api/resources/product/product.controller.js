const { Op } = require("sequelize");
// const { queue } = require("../../../kue");
const config = require("../../../config");
const AWS = require("aws-sdk");
const db = require("../../../models");
const BUCKET_NAME = "bangmobileapplication";

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// const s3Client = new S3Client({
//   region: "ap-south-1", // Replace with your AWS region
//   credentials: {
//     accessKeyId: "AKIAY55VZUUB7ZDB7JTP",
//     secretAccessKey: "GWRlhht3W4ZNsQ3c5mc2yv839XsG+i6uT6F/1ti2",
//   },
// });

var deleteFileFromS3 = async (imgUrl) => {
  try {
    const lastItem = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
    var params = {
      Bucket: "photoabhi",
      Key: lastItem,
    };
    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (error, data) => {
        if (error) {
          console.log(error, error.stack);
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  } catch (error) {
    console.log(error);
    throw new Error("Promise error");
  }
};

module.exports = {
  /* Add user api start here................................*/

  async addProduct(req, res, next) {
    console.log(req?.body, "asd7fa0s98d7f9a")
    try {
      const {
        categoryId,
        subCategoryId,
        childCategoryId,
        name,
        slug,
        brand,
        status,
        unitSize,
        sortDesc,
        desc,
        buyerPrice,
        price,
        qty,
        discount,
        discountPer,
        total,
        netPrice,
        paymentMode,
        createdId,
        createdType,
        isEnableEcommerce,
        isEnableCustomize,
        isBooking,
        photo,
        serviceType
      } = req.body;
      return db.product
        .create({
          categoryId: Number(categoryId),
          subCategoryId: Number(subCategoryId),
          childCategoryId: Number(childCategoryId),
          name: name,
          slug: slug,
          status: status,
          brand: brand,
          unitSize: unitSize,
          sortDesc: sortDesc,
          desc: desc,
          buyerPrice: buyerPrice,
          price: price,
          qty: qty,
          discount: discount,
          discountPer: discountPer,
          total: total,
          netPrice: netPrice,
          paymentMode: paymentMode,
          photo: photo ? photo : "",
          createdId: createdId,
          createdType: createdType,
          isEnableEcommerce: isEnableEcommerce,
          isEnableCustomize: isEnableCustomize,
          isBooking: isBooking,
          serviceType: serviceType
        })
        .then((product) => {
          res.status(200).json({
            success: true,
            msg: "Successfully inserted product",
            data: product,
          });
        })
        .catch(function (err) {
          console.log(err, "Erro34523r");
          next(err);
        });
    } catch (err) {
      console.error(err, "689579657");
      throw new RequestError("Error");
    }
  },

  async index(req, res, next) {
    try {
      const { supplierId, categoryId, subCategoryId } = req.query;
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            supplierId: supplierId,
            categoryId: categoryId,
            subCategoryId: subCategoryId,
          },
        })
        .then((product) => {
          res.status(200).json({ success: true, product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllProductList(req, res, next) {
    try {
      db.product
        .findAll({
          where: { status: 1 },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: db.store, // Include the associated store
              attributes: ["id", "status"], // Fetch only relevant store fields
              where: { status: 1 }, // Filter active stores
              required: true, // Ensure products without active stores are excluded
            },
            {
              model: db.subcategories,
              attributes: ["id", "sub_name"],
              include: [
                {
                  model: db.category,
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        })
        .then((products) => {
          res.status(200).json({ success: true, data: products, count: products.length });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async update(req, res, next) {
    try {
      const {
        id,
        productId,
        categoryId,
        subCategoryId,
        childCategoryId,
        name,
        slug,
        brand,
        status,
        unitSize,
        desc,
        buyerPrice,
        price,
        qty,
        sortDesc,
        discount,
        discountPer,
        total,
        netPrice,
        paymentMode,
        createdId,
        createdType,
        isEnableEcommerce,
        isEnableCustomize,
        isBooking,
        photo,
        serviceType
      } = req.body;
      db.product
        .findOne({ where: { id: id } })
        .then((product) => {
          if (product) {
            return db.product.update(
              {
                categoryId: categoryId ? categoryId : product.categoryId,
                subCategoryId: subCategoryId
                  ? subCategoryId
                  : product.subCategoryId,
                childCategoryId: childCategoryId
                  ? childCategoryId
                  : product.childCategoryId,
                name: name ? name : product.name,
                slug: slug ? slug : product.slug,
                status: status,
                brand: brand ? brand : product?.brand,
                unitSize: unitSize ? unitSize : product.unitSize,
                desc: desc ? desc : product.desc,
                sortDesc: sortDesc ? sortDesc : product.sortDesc,
                buyerPrice: buyerPrice ? buyerPrice : product.buyerPrice,
                price: price ? price : product.price,
                qty: qty ? qty : product.qty,
                discount: discount ? discount : product.discount,
                discountPer: discountPer ? discountPer : product.discountPer,
                total: total ? total : product.total,
                netPrice: netPrice ? netPrice : product.netPrice,
                paymentMode: paymentMode ? paymentMode : product.paymentMode,
                photo: photo ? photo : product.photo,
                createdId: createdId ? createdId : product.createdId,
                createdType: createdType ? createdType : product.createdType,
                isEnableEcommerce: isEnableEcommerce ? isEnableEcommerce : product.isEnableEcommerce,
                isEnableCustomize: isEnableCustomize ? isEnableCustomize : product.isEnableCustomize,
                isBooking: isBooking ? isBooking : product.isBooking,
                serviceType: serviceType ? serviceType : product.serviceType
              },
              { where: { id: product.id } }
            );
          }
          throw new RequestError("Not Found Product", 409);
        })
        .then((p) => {
          res.status(200).json({ success: true, msg: "Updated Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getProductListByCategory(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          where: {
            categoryId: req.query.categoryId,
            subCategoryId: req.query.subCategoryId,
          },
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  async getProductListById(req, res, next) {
    try {
      const product = await db.product.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: db.productphoto,
            attributes: ["id", "imgUrl"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err); // Pass the error to the next middleware or error handler
    }
  },

  async getWebProductListById(req, res, next) {
    try {
      db.product
        .findOne({
          where: { id: req.params.id },
          include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
          order: [["createdAt", "DESC"]],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  async addProductOffer(req, res, next) {
    try {
      const { productId, qty, discount_per, discount_price, total, net_price } =
        req.body;
      db.ProductOffer.findOne({ where: { id: productId } })
        .then((list) => {
          if (!list) {
            return db.ProductOffer.create({
              productId: productId,
              image: req.file ? req.file.location : "",
              qty: qty,
              discount_per: discount_per,
              discount_price: discount_price,
              total: total,
              net_price: net_price,
            });
          } else {
            return db.ProductOffer.update(
              {
                qty: qty,
                discount_per: discount_per,
                discount_price: discount_price,
                total: total,
                net_price: net_price,
              },
              { where: { id: list.id } }
            );
          }
        })
        .then((p) => {
          res.status(200).json({ success: true, msg: "Successfully" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getProductOffer(req, res, next) {
    try {
      db.ProductOffer.findAll({
        include: [
          {
            model: db.product,
            attributes: [
              "id",
              "categoryId",
              "price",
              "item_name",
              "description",
              "brand",
            ],
            include: [{ model: db.category, attributes: ["id", "name"] }],
          },
        ],
      })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async searchProductBySubCat(req, res, next) {
    try {
      db.subcategories
        .findOne({
          where: { sub_name: req.body.subCat },
        })
        .then((data) => {
          if (data) {
            return db.product.findAll({
              where: { subCategoryId: data.id },
            });
          }
        })
        .then((list) => {
          console.log(JSON.stringify(list));
          res.status(200).json({ success: true, data: list });
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async productDelete(req, res, next) {
    db.product
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then((product) => {
        if (product) {
          return db.product.destroy({ where: { id: product.id } });
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async productOfferDelete(req, res, next) {
    db.ProductOffer.findOne({ where: { id: parseInt(req.params.id) } })
      .then((product) => {
        if (product) {
          return db.ProductOffer.destroy({ where: { id: product.id } });
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  async multiplePhotoUpload(req, res, next) {
    let attachmentEntries = [];
    var productId = req.body.productId;
    for (var i = 0; i < req.files.length; i++) {
      attachmentEntries.push({
        productId: productId,
        name: req.files[i].filename,
        mime: req.files[i].mimetype,
        imgUrl: req.files[i].location,
      });
    }

    db.product
      .findOne({
        where: { id: productId },
      })
      .then((r) => {
        if (r) {
          return null;
          // .create("img-upload", {
          //   productId: productId,
          //   productName: r.item_name,
          //   attachmentEntries: attachmentEntries,
          // })
          // .save();
        }
        throw new RequestError("ProductId is not found");
      })
      .then((r) => {
        res.status(200).json({ success: r });
      })
      .catch(function (error) {
        console.log(error);
        res.status(500).json({ errors: ["Error insert photo"] });
      });
  },

  async getAllPhoto(req, res, next) {
    try {
      db.product
        .findAll({
          order: [["createdAt", "DESC"]],
          attributes: ["id", "name", "brand"],
          include: [{ model: db.productphoto, attributes: ["id", "imgUrl"] }],
        })
        .then((data) => {
          res.status(200).json({ success: true, data });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },
  async deleteSliderPhoto(req, res, next) {
    db.productphoto
      .findOne({ where: { id: parseInt(req.query.id) } })
      .then((product) => {
        if (product) {
          return db.productphoto.destroy({ where: { id: req.query.id } });
        }
        throw new RequestError("Product is not found");
      })
      .then((re) => {
        return res.status(200).json({ status: "deleted Product Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },
  //All GroceryStample product
  async getAllGrocerryStaples(req, res, next) {
    try {
      db.category
        .findOne({
          attributes: ["id", "slug"],
          where: { slug: "grocery-staple" },
          include: [
            {
              model: db.product,
              order: [["createdAt", "DESC"]],
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
              ],
            },
          ],
        })
        .then((product) => {
          res.status(200).json({ success: true, data: product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllProductBySlug(req, res, next) {
    try {
      db.category
        .findOne({
          attributes: ["id", "slug"],
          where: { slug: req.params.slug },
          include: [
            {
              model: db.product,
              order: [["createdAt", "DESC"]],
              include: [
                { model: db.productphoto, attributes: ["id", "imgUrl"] },
              ],
            },
          ],
        })
        .then((product) => {
          res.status(200).json({ success: true, data: product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  // filter product
  async getFilterbyProduct(req, res, next) {
    try {
      let search = "%%";
      if (req.query.search) {
        search = "%" + req.query.search + "%";
      }

      // Extract paymentModes from query parameters and convert to array of integers
      const paymentModes = req.query.paymentModes
        ? req.query.paymentModes.split(",").map((pm) => parseInt(pm.trim(), 10))
        : [];

      // Define product filter conditions
      const productWhere = {
        [Op.or]: [
          { name: { [Op.like]: search } },
          { slug: { [Op.like]: search } },
        ],
      };

      // Apply paymentModes filter if provided
      if (paymentModes.length > 0) {
        productWhere.paymentMode = {
          [db.Sequelize.Op.or]: paymentModes.map((mode) => ({
            [db.Sequelize.Op.like]: `%${mode}%`,
          })),
        };
      }

      // Find subcategories with filtered products
      const subcategories = await db.subcategories.findAll({
        attributes: ["id", "sub_name"],
        include: [
          {
            model: db.product,
            order: [["createdAt", "DESC"]],
            required: true,
            where: productWhere,
          },
        ],
      });

      res.status(200).json({ success: true, data: subcategories });
    } catch (err) {
      console.log(err, "Error");
      next(new RequestError("Error"));
    }
  },

  async GetAllByCategories(req, res, next) {
    try {
      // Extract categoryIds from the query parameters
      const { categoryIds } = req.query;

      // Ensure categoryIds is an array, even if a single ID is passed
      const categoryArray = Array.isArray(categoryIds)
        ? categoryIds
        : categoryIds.split(",");

      // Find all products that belong to the specified categories
      const products = await db.product.findAll({
        where: {
          categoryId: {
            [db.Sequelize.Op.in]: categoryArray,
          },
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.productphoto,
            attributes: ["id", "imgUrl"],
          },
        ],
      });

      res.status(200).json({ success: true, data: products });
    } catch (err) {
      console.log(err, "Error");
      next(new RequestError("Error"));
    }
  },

  // aws image delete
  async awsProductPhotoDelete(req, res, next) {
    try {
      const { id, imgUrl } = req.body;
      deleteFileFromS3(imgUrl)
        .then((data) => {
          if (!data) {
            return db.productphoto.destroy({ where: { id: id } });
          }
          throw new RequestError("error");
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            msg: "Successflly deleted image from s3 Bucket",
          });
        });
    } catch (err) {
      next(err);
      // res.status(500).json({'success':false, msg: err})
    }
  },

  async getProductSubChildCat(req, res, next) {
    try {
      const { subCategoryId, childCategoryId } = req.body;
      db.product
        .findAll({
          where: {
            childCategoryId: childCategoryId,
            subCategoryId: childCategoryId,
          },
        })
        .then((product) => {
          res.status(200).json({ success: true, data: product });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      next(err);
      // res.status(500).json({ 'success':false, msg: err})
    }
  },

  async getProductsByOpenStores(req, res, next) {
    try {
      const currentHour = new Date().getHours(); // Get the current hour

      // Find all stores that are currently open
      const openStores = await db.store.findAll({
        where: {
          openTime: { [db.Sequelize.Op.lte]: currentHour }, // Store must be open at or before the current hour
          closeTime: { [db.Sequelize.Op.gte]: currentHour }, // Store must close at or after the current hour
        },
        attributes: ["id"], // Only need store IDs for filtering
      });

      const openStoreIds = openStores.map(store => store.id);

      // Query to find products that are sold in the open stores
      const products = await db.product.findAll({
        include: [
          {
            model: db.store_product, // Ensure this association exists
            where: {
              supplierId: {
                [db.Sequelize.Op.in]: openStoreIds, // Filter by stores that are currently open
              },
              status: 1,
            },
            attributes: [], // No need to fetch attributes from store_product
          },
        ],
      });

      if (products.length > 0) { // Check if there are any products
        res.status(200).json({ success: true, data: products });
      } else {
        res.status(404).json({ success: false, message: "No products found from open stores" });
      }
    } catch (err) {
      console.error(err, "Error");
      next(new RequestError("Error"));
    }
  }


};
