const Sequelize = require("sequelize");
const db = require("../../../models");

module.exports = {
  async index(req, res, next) {
    try {
      const {
        custId,
        paymentmethod,
        orderId,
        deliveryAddress,
        productIds,
        grandTotal,
        qty,
        storeId,
        customization,
        cutomerDeliveryDate,
        orderType,
        size,
        unitSize,
        sizeDetails
      } = req.body;

      // Parse sizeDetails if it's a string
      let parsedSizeDetails = null;
      if (sizeDetails) {
        try {
          parsedSizeDetails = typeof sizeDetails === 'string' 
            ? JSON.parse(sizeDetails) 
            : sizeDetails;
        } catch (e) {
          console.error("Error parsing sizeDetails:", e);
        }
      }

      db.user
        .findOne({ where: { id: custId } })
        .then((p) => {
          if (p) {
            return db.orders.create({
              custId: custId,
              number: orderId,
              grandtotal: grandTotal,
              paymentmethod: paymentmethod,
              productIds: productIds,
              qty: qty,
              storeId: storeId,
              orderType: orderType,
              customization: customization ? customization : null,
              cutomerDeliveryDate: cutomerDeliveryDate ? cutomerDeliveryDate : null,
              deliveryAddress: Object.values(deliveryAddress).join(", "),
              size: size || null,
              unitSize: unitSize || null,
              sizeDetails: parsedSizeDetails
            });
          }
          return res.status(500).json({ errors: ["User is not found"] });
        })
        .then((success) => {
          res.status(200).json({ success: true, data: success });
        })
        .catch(function (err) {
          console.log(err, "sdfasd");
          res.status(500).json({ errors: ["Error adding cart"] });
        });
    } catch (err) {
      throw new RequestError("Error");
    }
  },

  async getAllOrderList(req, res, next) {
    try {
      db.orders
        .findAll({
          order: [["createdAt", "DESC"]],
          include: [{ model: db.addresses }],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list, count : list.length  });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },

  async statusUpdate(req, res, next) {
    try {
      const { id, status, deliverydate } = req.body;
      db.orders
        .findOne({ where: { id: id } })
        .then((list) => {
          return db.orders.update(
            {
              status: status,
              deliverydate: deliverydate ? deliverydate : list.deliverydate,
            },
            { where: { id: id } }
          );
        })
        .then((success) => {
          res
            .status(200)
            .json({ success: true, msg: "Successfully Updated Status" });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },

  async getAllOrderListById(req, res, next) {
    try {
      // Fetch orders for the given customer ID
      const orders = await db.orders.findAll({
        where: { custId: req.params.id },
        order: [["createdAt", "DESC"]],
        include: [{ model: db.addresses }],
      });

      // Extract unique product IDs for all orders
      const productIds = orders.flatMap((order) =>
        Array.isArray(order.productIds) ? order.productIds : [order.productIds]
      );
      const uniqueProductIds = [...new Set(productIds)];

      // Fetch all unique products
      const products = await db.product.findAll({
        where: { id: uniqueProductIds },
      });

      // Attach only relevant products to each order
      const ordersWithProducts = orders.map((order) => {
        const orderProductIds = Array.isArray(order.productIds)
          ? order.productIds
          : [order.productIds];
        return {
          ...order.toJSON(),
          products: products.filter((product) =>
            orderProductIds.includes(product.id)
          ),
        };
      });

      res.status(200).json({ success: true, data: ordersWithProducts, count: ordersWithProducts.length  });
    } catch (err) {
      next(err);
    }
  },

  async getAllOrderListBySoreId(req, res, next) {
    try {
      const orders = await db.orders.findAll({
        where: { storeId: req.params.id },
        order: [["createdAt", "DESC"]],
        include: [
          // { model: db.addresses }, // Temporarily removed for debugging
          { model: db.user }, // Include user details
        ],
      });

      const productIds = orders.flatMap((order) => order.productIds || []);
      const uniqueProductIds = [...new Set(productIds)];

      const products = await db.product.findAll({
        where: { id: uniqueProductIds },
      });

      const ordersWithProducts = orders.map((order) => ({
        ...order.toJSON(),
        products: products.filter((product) =>
          uniqueProductIds?.includes(product.id)
        ),
      }));

      res.status(200).json({ success: true, data: ordersWithProducts, count: ordersWithProducts.length   });
    } catch (err) {
      next(err);
    }
  },

  async getAllOrderStatus(req, res, next) {
    try {
      db.orders
        .findAll({
          where: { status: req.body.status },
          order: [["createdAt", "DESC"]],
          include: [{ model: db.addresses, include: [{ model: db.carts }] }],
        })
        .then((list) => {
          res.status(200).json({ success: true, order: list, count: list.length });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },
  async getAllOrderCount(req, res, next) {
    try {
      db.orders
        .findAll({
          attributes: [
            "status",
            [Sequelize.fn("COUNT", Sequelize.col("status")), "total"],
          ],
          group: ["status"],
        })
        .then((list) => {
          res.status(200).json({ success: true, data: list });
        })
        .catch(function (err) {
          next(err);
        });
    } catch (err) {
      res.status(500).json({ errors: "" + err });
    }
  },
};
