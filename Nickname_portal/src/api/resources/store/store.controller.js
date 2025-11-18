const db = require("../../../models");
const { haversineDistance, extractLatLngFromGoogleMapsUrl } = require("../../../utils/distance"); // Import the distance utility

module.exports = {
  /* Add user api start here................................*/

  async index(req, res, next) {
    try {
      const {
        id,
        storename,
        status,
        storeaddress,
        storedesc,
        ownername,
        owneraddress,
        email,
        password,
        phone,
        areaId,
        accountNo,
        accountHolderName,
        IFSC,
        bankName,
        branch,
        adharCardNo,
        panCardNo,
        GSTNo,
        website,
        openTime,
        closeTime,
        storeImage,
        verifyDocument
      } = req.body;
      db.store
        .findOne({ where: { id: id ? id : null } })
        .then((supplier) => {
          if (supplier) {
            return db.store.update(
              {
                storename: storename ? storename : supplier.storename,
                status: status ? status : supplier.status,
                storeaddress: storeaddress
                  ? storeaddress
                  : supplier.storeaddress,
                storedesc: storedesc ? storedesc : supplier.storedesc,
                ownername: ownername ? ownername : supplier.ownername,
                owneraddress: owneraddress
                  ? owneraddress
                  : supplier.owneraddress,
                email: email ? email : supplier.email,
                phone: phone ? phone : supplier.phone,
                accountNo: accountNo ? accountNo : supplier.accountNo,
                accountHolderName: accountHolderName
                  ? accountHolderName
                  : supplier.accountHolderName,
                IFSC: IFSC ? IFSC : supplier.IFSC,
                bankName: bankName ? bankName : supplier.bankName,
                branch: branch ? branch : supplier.branch,
                adharCardNo: adharCardNo ? adharCardNo : supplier.adharCardNo,
                panCardNo: panCardNo ? panCardNo : supplier.panCardNo,
                GSTNo: GSTNo ? GSTNo : supplier.GSTNo,
                website: website ? website : supplier.website,
                openTime: openTime ? openTime : supplier.openTime,
                closeTime: closeTime ? closeTime : supplier.closeTime,
                storeImage: storeImage ? storeImage : supplier.storeImage,
                verifyDocument: verifyDocument ? verifyDocument : supplier.verifyDocument,
              },
              { where: { id: id } }
            );
          }
          return db.store.create({
            storename: storename ? storename : null,
            status: status ? status : 0,
            storeaddress: storeaddress ? storeaddress : null,
            storedesc: storedesc ? storedesc : null,
            ownername: ownername ? ownername : null,
            owneraddress: owneraddress ? owneraddress : null,
            email: email ? email : null,
            password: password ? password : null,
            phone: phone ? phone : null,
            accountNo: accountNo ? accountNo : null,
            accountHolderName: accountHolderName ? accountHolderName : null,
            IFSC: IFSC ? IFSC : null,
            bankName: bankName ? bankName : null,
            branch: branch ? branch : null,
            adharCardNo: adharCardNo ? adharCardNo : null,
            panCardNo: panCardNo ? panCardNo : null, // Added null check
            GSTNo: GSTNo ? GSTNo : null, // Added null check
            areaId: areaId,
            website: website ? website : null, // Added null check
            openTime: openTime ? openTime : null, // Added null check
            closeTime: closeTime ? closeTime : null, // Added null check and removed duplicate
            storeImage: storeImage ? storeImage : "",
            verifyDocument: verifyDocument ? verifyDocument : "",
          });
        })
        .then((store) => {
          res.status(200).json({
            success: true,
            msg: "Successfully inserted supplier",
            data: store,
          });
        })
        .catch(function (err) {
          console.log(err);
          next(err);
        });
    } catch (err) {
      console.log(err);
      throw new RequestError("Error");
    }
  },

  async storeAddProduct(req, res, next) {
    try {
      const { supplierId, productId, unitSize, buyerPrice } = req.body;
      db.store_product
        .findAll({
          where: {
            supplierId: supplierId,
            productId: productId,
            unitSize: unitSize,
          },
        })
        .then((data) => {
          if (!data.length > 0) {
            return db.store_product.create({
              supplierId: supplierId,
              productId: productId,
              unitSize: unitSize,
              price: buyerPrice,
            });
          } else {
            return db.store_product.update(
              {
                unitSize: unitSize ? unitSize : data.unitSize,
                price: buyerPrice ? buyerPrice : data.buyerPrice,
              },
              { where: { supplierId: supplierId, productId: productId } }
            );
          }
        })
        .then((success) => {
          res.status(200).json({
            success: true,
            msg: "Successfully inserted product in storeList",
          });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllstore(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }

    try {
      // Define all store attributes to be selected
      const storeAttributes = [
        'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'storeImage', 'verifyDocument', 'location'
      ];

      // Construct the attributes array for the main query, including flattened attributes from includes and the product count
      const attributesToSelect = [
        ...storeAttributes,
        [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
      ];

      // Construct the group by array, including all non-aggregated attributes from the main model and included models
      const groupByColumns = [
        ...storeAttributes.map(attr => `store.${attr}`),
        'area.id', 'area.name',
        'area->location.id', 'area->location.name'
      ];

      const list = await db.store.findAll({
        attributes: attributesToSelect,
        where: { status: "1" }, // Add this line to filter by status = 1
        include: [
          {
            model: db.area,
            attributes: [], // Attributes are selected in the main query's attributes array
            include: [{ model: db.location, attributes: [] }], // Attributes are selected in the main query's attributes array
            required: false // Use LEFT JOIN to include stores even if they don't have an associated area/location
          },
          {
            model: db.store_product, // Assuming this is the join table between store and product
            attributes: [], // Don't select attributes from store_product itself
            required: false // Use LEFT JOIN to count products, even if a store has none
          },
        ],
        group: groupByColumns,
        raw: true // Return raw data objects, flattening included model attributes
      });

      // Calculate distance for each store if currentLocation is provided
      const storesWithDistance = list.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });

      res.status(200).json({ success: true, data: storesWithDistance, count: storesWithDistance.length });
    } catch (err) {
      console.error(err); // Log the error for debugging
      throw new RequestError("Error");
    }
  },
  async getServiceAllstore(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }
    try {
      // Find all product IDs that match the filters
      const products = await db.product.findAll({
        where: {
          serviceType: "Service"
        },
        attributes: ["id"],
      });

      const productIds = products.map((product) => product.id);

      // Check if productIds is empty
      if (productIds.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0 });
      }

      // Find all stores that are associated with those products and get their product count
      const stores = await db.store.findAll({
        attributes: [
          'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'location', 'storeImage', 'verifyDocument',
          // Add the count of associated products as 'totalProducts'
          [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
        ],
        include: [
          {
            model: db.store_product,
            attributes: [], // No need to fetch attributes from store_product itself
            where: {
              productId: {
                [db.Sequelize.Op.in]: productIds,
              },
            },
            required: true // Ensures only stores with matching products are returned (INNER JOIN)
          },
        ],
        group: [
          // All non-aggregated attributes from the 'attributes' array must be in the 'group' clause
          'store.id', 'store.storename', 'store.status', 'store.storeaddress', 'store.storedesc', 'store.ownername', 'store.owneraddress', 'store.email', 'store.phone', 'store.accountNo', 'store.accountHolderName', 'store.IFSC', 'store.bankName', 'store.branch', 'store.adharCardNo', 'store.panCardNo', 'store.GSTNo', 'store.areaId', 'store.website', 'store.openTime', 'store.closeTime', 'store.location', 'store.storeImage', 'store.verifyDocument'
        ],
        raw: true, // Return raw data to easily access the 'totalProducts' alias,
        where: {
          status: "1",
        },
      });

      const storesWithDistance = stores.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });

      res.status(200).json({ success: true, data: storesWithDistance, count: stores.length });
    } catch (err) {
      console.log(err, "Error");
      next(new RequestError("Error"));
    }
  },

  async adminGetAllstore(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }

    try {
      // Define all store attributes to be selected
      const storeAttributes = [
        'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'storeImage', 'verifyDocument', 'location'
      ];

      // Construct the attributes array for the main query, including flattened attributes from includes and the product count
      const attributesToSelect = [
        ...storeAttributes,
        [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
      ];

      // Construct the group by array, including all non-aggregated attributes from the main model and included models
      const groupByColumns = [
        ...storeAttributes.map(attr => `store.${attr}`),
        'area.id', 'area.name',
        'area->location.id', 'area->location.name'
      ];

      const list = await db.store.findAll({
        attributes: attributesToSelect,
        include: [
          {
            model: db.area,
            attributes: [], // Attributes are selected in the main query's attributes array
            include: [{ model: db.location, attributes: [] }], // Attributes are selected in the main query's attributes array
            required: false // Use LEFT JOIN to include stores even if they don't have an associated area/location
          },
          {
            model: db.store_product, // Assuming this is the join table between store and product
            attributes: [], // Don't select attributes from store_product itself
            required: false // Use LEFT JOIN to count products, even if a store has none
          },
        ],
        group: groupByColumns,
        raw: true // Return raw data objects, flattening included model attributes
      });

      // Calculate distance for each store if currentLocation is provided
      const storesWithDistance = list.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });

      res.status(200).json({ success: true, data: storesWithDistance, count: storesWithDistance.length });
    } catch (err) {
      console.error(err); // Log the error for debugging
      throw new RequestError("Error");
    }
  },

  //Get by Id
  async getstoreById(req, res, next) {
    const { currentLocation } = req.query;
    const { id } = req.params;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }
    try {

      // Define all store attributes to be selected
      const storeAttributes = [
        'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'storeImage', 'verifyDocument', 'location'
      ];
      // Construct the attributes array for the main query, including flattened attributes from includes and the product count
      const attributesToSelect = [
        ...storeAttributes,
        // Add the count of associated products as 'totalProducts'
        [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
      ];

      // Construct the group by array, including all non-aggregated attributes from the main model and included models
      const groupByColumns = [
        ...storeAttributes.map(attr => `store.${attr}`),];

      const list = await db.store
        .findOne({
          attributes: attributesToSelect,
          where: { id: id },
          include: [
            {
              model: db.area,
              attributes: [], // Attributes are selected in the main query's attributes array
              include: [{ model: db.location, attributes: [] }], // Attributes are selected in the main query's attributes array
              required: false // Use LEFT JOIN
            },
            {
              model: db.user, // Include related user data
              attributes: [], // Attributes are selected in the main query's attributes array
              required: false // Use LEFT JOIN if user is optional
            },
            {
              model: db.store_product, // Assuming this is the join table between store and product
              attributes: [], // Don't select attributes from store_product itself
              required: false // Use LEFT JOIN to count products, even if a store has none
            },
          ],
          group: groupByColumns,
          raw: true // Return raw data objects, flattening included model attributes
        });

      // Calculate distance for the store if currentLocation is provided
      let storeWithDistance = list ? { ...list } : null; // Initialize with a copy of list or null

      if (storeWithDistance && userLat !== undefined && userLon !== undefined && storeWithDistance.location) {
        const storeCoords = extractLatLngFromGoogleMapsUrl(storeWithDistance.location);
        if (storeCoords) {
          const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
          storeWithDistance.distance = parseFloat(distance.toFixed(2)); // Round to 2 decimal places
        } else {
          storeWithDistance.distance = null; // Set distance to null if not calculable
        }
      } else if (storeWithDistance) {
        storeWithDistance.distance = null; // Set distance to null if not calculable
      }

      if (storeWithDistance) {
        res.status(200).json({ success: true, data: storeWithDistance });
      } else {
        res.status(404).json({ success: false, message: "Store not found" });
      }
    } catch (err) {
      console.error(err); // Log the error for debugging
      next(new RequestError("Error"));
    }
  },

  async getAllstoreProduct(req, res, next) {
    try {
      db.product
        .findAll({
          include: [
            {
              model: db.store_product,
              attributes: [
                "id",
                "supplierId",
                "productId",
                "unitSize",
                "price",
              ],
              include: [
                {
                  model: db.store,
                },
              ],
            },
          ],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list, count: list.length });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getProductBystore(req, res, next) {
    const { isEnableEcommerce, isEnableCustomize } = req.query; // Get query parameters

    const productWhere = {}; // Initialize where clause for product model

    // Apply filter for isEnableEcommerce if provided
    // Assuming frontend sends '1' or '0' as string
    if (isEnableEcommerce !== undefined) {
      productWhere.isEnableEcommerce = isEnableEcommerce;
    }

    // Apply filter for isEnableCustomize if provided
    // Assuming frontend sends '1' or '0' as string, convert to number as per frontend logic
    if (isEnableCustomize !== undefined) {
      productWhere.isEnableCustomize = isEnableCustomize;
    }
    try {
      db.store_product
        .findAll({
          where: { supplierId: req.params.id },
          include: [
            {
              model: db.product,
              where: {
                ...productWhere,
                status: "1", // Filter products with status equal to 1
              },
            },
          ],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list, count: list.length });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAdminProductBystore(req, res, next) {
    const { isEnableEcommerce, isEnableCustomize } = req.query; // Get query parameters

    const productWhere = {}; // Initialize where clause for product model

    // Apply filter for isEnableEcommerce if provided
    // Assuming frontend sends '1' or '0' as string
    if (isEnableEcommerce !== undefined) {
      productWhere.isEnableEcommerce = isEnableEcommerce;
    }

    // Apply filter for isEnableCustomize if provided
    // Assuming frontend sends '1' or '0' as string, convert to number as per frontend logic
    if (isEnableCustomize !== undefined) {
      productWhere.isEnableCustomize = isEnableCustomize;
    }
    try {
      db.store_product
        .findAll({
          where: { supplierId: req.params.id },
          include: [
            {
              model: db.product,
              where: {
                ...productWhere,
              },
            },
          ],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list, count: list.length });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async storeUpdate(req, res, next) {
    try {
      const {
        id,
        storename,
        status,
        storeaddress,
        storedesc,
        ownername,
        owneraddress,
        email,
        password,
        phone,
        areaId,
        accountNo,
        accountHolderName,
        IFSC,
        bankName,
        branch,
        adharCardNo,
        panCardNo,
        GSTNo,
        website,
        openTime,
        closeTime,
        location,
        storeImage,
        verifyDocument
      } = req.body;
      db.store
        .findOne({ where: { id: id } })
        .then((list) => {
          if (list) {
            return db.store.update(
              {
                storename: storename ? storename : list?.storename,
                status: status ? status : list?.status,
                storeaddress: storeaddress ? storeaddress : list?.storeaddress,
                storedesc: storedesc ? storedesc : list?.storedesc,
                ownername: ownername ? ownername : list?.ownername,
                owneraddress: owneraddress ? owneraddress : list?.owneraddress,
                email: email ? email : list?.email,
                password: password ? password : list?.password,
                phone: phone ? phone : list?.phone,
                accountNo: accountNo ? accountNo : list?.accountNo,
                accountHolderName: accountHolderName
                  ? accountHolderName
                  : list?.accountHolderName,
                IFSC: IFSC ? IFSC : list?.IFSC,
                bankName: bankName ? bankName : list?.bankName,
                branch: branch ? branch : list?.branch,
                adharCardNo: adharCardNo ? adharCardNo : list?.adharCardNo,
                panCardNo: panCardNo ? panCardNo : list?.panCardNo,
                GSTNo: GSTNo ? GSTNo : list?.GSTNo,
                areaId: areaId ? areaId : list?.areaId,
                website: website ? website : list?.website,
                openTime: openTime ? openTime : list?.openTime,
                closeTime: closeTime ? closeTime : list?.closeTime,
                location: location ? location : list?.location,
                storeImage: storeImage ? storeImage : list?.storeImage,
                verifyDocument: verifyDocument ? verifyDocument : list?.verifyDocument,
              },
              { where: { id: id } }
            );
          }
          throw new RequestError("No data found", 409);
        })
        .then((store) => {
          res
            .status(200)
            .json({ success: true, msg: "Updated Successfully", data: store });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async storeDelete(req, res, next) {
    try {
      db.store
        .findOne({ where: { id: req.params.id } })
        .then((data) => {
          if (data) {
            return db.store.destroy({ where: { id: data.id } });
          }
          throw new RequestError("Seller is not found");
        })
        .then((re) => {
          return res
            .status(200)
            .json({ success: true, status: "deleted Product Successfully" });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async storeProductDelete(req, res, next) {
    try {
      db.store_product
        .findOne({ where: { id: req.body.id } })
        .then((data) => {
          if (data) {
            return db.store_product.destroy({ where: { id: req.body.id } });
          }
          throw new RequestError("Product is not found");
        })
        .then((re) => {
          return res.status(200).json({
            success: true,
            status: "Successfully deleted Product from store list",
          });
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllStoresByCategories(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }
    try {
      const { categoryIds } = req.query; // Assuming the category IDs are passed as a query parameter

      // Parse categoryIds into an array if it's a string (e.g., "1,2,3")
      const categoryArray = Array.isArray(categoryIds)
        ? categoryIds
        : categoryIds.split(",");

      // Find all product IDs that belong to the specified categories
      const products = await db.product.findAll({
        where: {
          categoryId: {
            [db.Sequelize.Op.in]: categoryArray,
          },
        },
        attributes: ["id"],
      });

      const productIds = products.map((product) => product.id);

      // Check if productIds is empty
      if (productIds.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0 });
      }
      // Find all stores that are associated with those products and get their product count
      const stores = await db.store.findAll({
        attributes: [
          'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'location', 'storeImage', 'verifyDocument',
          // Add the count of associated products as 'totalProducts'
          [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
        ],
        include: [
          {
            model: db.store_product,
            attributes: [], // No need to fetch attributes from store_product itself
            where: {
              productId: {
                [db.Sequelize.Op.in]: productIds,
              },
            },
            required: true // Ensures only stores with matching products are returned (INNER JOIN)
          },
        ],
        group: [
          // All non-aggregated attributes from the 'attributes' array must be in the 'group' clause
          'store.id', 'store.storename', 'store.status', 'store.storeaddress', 'store.storedesc', 'store.ownername', 'store.owneraddress', 'store.email', 'store.phone', 'store.accountNo', 'store.accountHolderName', 'store.IFSC', 'store.bankName', 'store.branch', 'store.adharCardNo', 'store.panCardNo', 'store.GSTNo', 'store.areaId', 'store.website', 'store.openTime', 'store.closeTime', 'store.location', 'store.storeImage', 'store.verifyDocument'
        ],
        raw: true, // Return raw data to easily access the 'totalProducts' alias,
        where: {
          status: "1",
        },
      });

      const storesWithDistance = stores.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });
      res.status(200).json({ success: true, data: storesWithDistance, count: stores.length });
    } catch (err) {
      next(new RequestError("Error"));
    }
  },

  async getServiceAllStoresByCategories(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }
    try {
      const { categoryIds } = req.query; // Assuming the category IDs are passed as a query parameter

      // Parse categoryIds into an array if it's a string (e.g., "1,2,3")
      const categoryArray = Array.isArray(categoryIds)
        ? categoryIds
        : categoryIds.split(",");

      // Find all product IDs that belong to the specified categories
      const products = await db.product.findAll({
        where: {
          categoryId: {
            [db.Sequelize.Op.in]: categoryArray,
          },
          serviceType: "Service"
        },
        attributes: ["id"],
      });

      const productIds = products.map((product) => product.id);

      // Check if productIds is empty
      if (productIds.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0 });
      }

      // Find all stores associated with those products via store_product
      const stores = await db.store.findAll({
        attributes: [
          'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'storeImage', 'verifyDocument',
          // Add the count of associated products as 'totalProducts'
          [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
        ],
        include: [
          {
            model: db.store_product,
            where: {
              productId: {
                [db.Sequelize.Op.in]: productIds,
              },
            },
            attributes: [], // No need to fetch attributes from store_product
            required: true // Ensures only stores with matching products are returned (INNER JOIN)
          },
        ],
        group: [
          // All non-aggregated attributes from the 'attributes' array must be in the 'group' clause
          'store.id', 'store.storename', 'store.status', 'store.storeaddress', 'store.storedesc', 'store.ownername', 'store.owneraddress', 'store.email', 'store.phone', 'store.accountNo', 'store.accountHolderName', 'store.IFSC', 'store.bankName', 'store.branch', 'store.adharCardNo', 'store.panCardNo', 'store.GSTNo', 'store.areaId', 'store.website', 'store.openTime', 'store.closeTime', 'store.storeImage', 'store.verifyDocument', 'store.location'
        ],
        raw: true, // Return raw data to easily access the 'totalProducts' alias
        where: {
          status: "1",
        },
      });

      const storesWithDistance = stores.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });

      res.status(200).json({ success: true, data: storesWithDistance, count: stores.length });
    } catch (err) {
      next(new RequestError("Error"));
    }
  },

  async getAllStoresByFilters(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }
    try {
      const { search, paymentModes } = req.query; // Extract filters from query parameters

      // Initialize filter conditions for products
      const productWhere = {};
      const paymentModeArray = paymentModes
        ? paymentModes.split(",").map((pm) => parseInt(pm.trim(), 10))
        : []; // Ensure integers

      // Apply filter by product name if provided
      if (search) {
        productWhere.name = {
          [db.Sequelize.Op.like]: `%${search}%`,
        };
      }

      // Apply filter by payment modes if provided
      if (paymentModes) {
        productWhere.paymentMode = {
          [db.Sequelize.Op.or]: paymentModeArray.map((mode) => ({
            [db.Sequelize.Op.like]: `%${mode}%`,
          })),
        };
      }

      // Find all product IDs that match the filters
      const products = await db.product.findAll({
        where: productWhere,
        attributes: ["id"],
      });

      const productIds = products.map((product) => product.id);

      // Check if productIds is empty
      if (productIds.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0 });
      }

      // Find all stores that are associated with those products and get their product count
      const stores = await db.store.findAll({
        attributes: [
          'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'location', 'storeImage', 'verifyDocument',
          // Add the count of associated products as 'totalProducts'
          [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
        ],
        include: [
          {
            model: db.store_product,
            attributes: [], // No need to fetch attributes from store_product itself
            where: {
              productId: {
                [db.Sequelize.Op.in]: productIds,
              },
            },
            required: true // Ensures only stores with matching products are returned (INNER JOIN)
          },
        ],
        group: [
          // All non-aggregated attributes from the 'attributes' array must be in the 'group' clause
          'store.id', 'store.storename', 'store.status', 'store.storeaddress', 'store.storedesc', 'store.ownername', 'store.owneraddress', 'store.email', 'store.phone', 'store.accountNo', 'store.accountHolderName', 'store.IFSC', 'store.bankName', 'store.branch', 'store.adharCardNo', 'store.panCardNo', 'store.GSTNo', 'store.areaId', 'store.website', 'store.openTime', 'store.closeTime', 'store.location', 'store.storeImage', 'store.verifyDocument'
        ],
        raw: true, // Return raw data to easily access the 'totalProducts' alias,
        where: {
          status: "1"
        },
      });

      const storesWithDistance = stores.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });

      res.status(200).json({ success: true, data: storesWithDistance, count: stores.length });
    } catch (err) {
      console.log(err, "Error");
      next(new RequestError("Error"));
    }
  },

  async getServiceAllStoresByFilters(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }
    try {
      const { search, paymentModes } = req.query; // Extract filters from query parameters

      // Initialize filter conditions for products
      const productWhere = {};
      const paymentModeArray = paymentModes
        ? paymentModes.split(",").map((pm) => parseInt(pm.trim(), 10))
        : []; // Ensure integers

      // Apply filter by product name if provided
      if (search) {
        productWhere.name = {
          [db.Sequelize.Op.like]: `%${search}%`,
        };
      }

      // Apply filter by payment modes if provided
      if (paymentModes) {
        productWhere.paymentMode = {
          [db.Sequelize.Op.or]: paymentModeArray.map((mode) => ({
            [db.Sequelize.Op.like]: `%${mode}%`,
          })),
        };
      }

      productWhere.serviceType = "Service";

      // Find all product IDs that match the filters
      const products = await db.product.findAll({
        where: productWhere,
        attributes: ["id"],
      });

      const productIds = products.map((product) => product.id);

      // Check if productIds is empty
      if (productIds.length === 0) {
        return res.status(200).json({ success: true, data: [], count: 0 });
      }

      // Find all stores that are associated with those products and get their product count
      const stores = await db.store.findAll({
        attributes: [
          'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'location', 'storeImage', 'verifyDocument',
          // Add the count of associated products as 'totalProducts'
          [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
        ],
        include: [
          {
            model: db.store_product,
            attributes: [], // No need to fetch attributes from store_product itself
            where: {
              productId: {
                [db.Sequelize.Op.in]: productIds,
              },
            },
            required: true // Ensures only stores with matching products are returned (INNER JOIN)
          },
        ],
        group: [
          // All non-aggregated attributes from the 'attributes' array must be in the 'group' clause
          'store.id', 'store.storename', 'store.status', 'store.storeaddress', 'store.storedesc', 'store.ownername', 'store.owneraddress', 'store.email', 'store.phone', 'store.accountNo', 'store.accountHolderName', 'store.IFSC', 'store.bankName', 'store.branch', 'store.adharCardNo', 'store.panCardNo', 'store.GSTNo', 'store.areaId', 'store.website', 'store.openTime', 'store.closeTime', 'store.location', 'store.storeImage', 'store.verifyDocument'
        ],
        raw: true, // Return raw data to easily access the 'totalProducts' alias,
        where: {
          status: "1"
        },
      });

      const storesWithDistance = stores.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });

      res.status(200).json({ success: true, data: storesWithDistance, count: stores.length });
    } catch (err) {
      console.log(err, "Error");
      next(new RequestError("Error"));
    }
  },

  async getOpenStores(req, res, next) {
    const { currentLocation } = req.query;
    let userLat, userLon;
    if (currentLocation) {
      const coords = currentLocation.split(',').map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        userLat = coords[0];
        userLon = coords[1];
      } else {
        console.warn("Invalid currentLocation format:", currentLocation);
      }
    }
    try {
      const currentHour = new Date().getHours(); // Get the current hour

      // Define all store attributes to be selected
      const storeAttributes = [
        'id', 'storename', 'status', 'storeaddress', 'storedesc', 'ownername', 'owneraddress', 'email', 'phone', 'accountNo', 'accountHolderName', 'IFSC', 'bankName', 'branch', 'adharCardNo', 'panCardNo', 'GSTNo', 'areaId', 'website', 'openTime', 'closeTime', 'storeImage', 'verifyDocument', 'location'
      ];

      // Construct the attributes array for the main query, including flattened attributes from includes and the product count
      const attributesToSelect = [
        ...storeAttributes,
        [db.Sequelize.fn('COUNT', db.Sequelize.col('store_products.productId')), 'totalProducts']
      ];

      // Construct the group by array, including all non-aggregated attributes from the main model and included models
      const groupByColumns = [
        ...storeAttributes.map(attr => `store.${attr}`),
        'area.id', 'area.name',
        'area->location.id', 'area->location.name'
      ];

      // Query to find open stores based on current hour
      const openStores = await db.store.findAll({
        attributes: attributesToSelect,
        where: {
          openTime: { [db.Sequelize.Op.lte]: currentHour }, // Store must be open at or before the current hour
          closeTime: { [db.Sequelize.Op.gte]: currentHour }, // Store must close at or after the current hour
          status: "1",
        },
        include: [
          {
            model: db.area,
            attributes: [], // Attributes are selected in the main query's attributes array
            include: [{ model: db.location, attributes: [] }], // Attributes are selected in the main query's attributes array
            required: false // Use LEFT JOIN
          },
          {
            model: db.store_product, // Assuming this is the join table between store and product
            attributes: [], // Don't select attributes from store_product itself
            required: false // Use LEFT JOIN to count products, even if a store has none
          },
        ],
        group: groupByColumns,
        raw: true // Return raw data objects, flattening included model attributes
      });

      const storesWithDistance = openStores.map(store => {
        if (userLat !== undefined && userLon !== undefined && store.location) {
          const storeCoords = extractLatLngFromGoogleMapsUrl(store.location);
          if (storeCoords) {
            const distance = haversineDistance(userLat, userLon, storeCoords.lat, storeCoords.lon);
            return { ...store, distance: parseFloat(distance.toFixed(2)) }; // Round to 2 decimal places
          }
        }
        return { ...store, distance: null }; // Set distance to null if not calculable
      });

      if (openStores.length > 0) {
        res.status(200).json({ success: true, data: storesWithDistance, count: openStores.length });
      } else {
        res
          .status(404)
          .json({ success: false, message: "No open stores found", count: 0 });
      }
    } catch (err) {
      console.error(err, "Error");
      next(new RequestError("Error"));
    }
  },
};
