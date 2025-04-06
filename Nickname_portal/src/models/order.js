'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('orders', {
    custId: DataTypes.INTEGER,
    number: DataTypes.STRING,
    paymentmethod: DataTypes.STRING,
    deliverydate: DataTypes.DATE,
    grandtotal: DataTypes.INTEGER, 
    status: DataTypes.ENUM('processing','shipping','delieverd','cancel'),
    productIds :  DataTypes.INTEGER,
    qty :  DataTypes.INTEGER,
    storeId: DataTypes.INTEGER,
    customization : DataTypes.STRING,
  }, {});
  Order.associate = function(models) {
    // associations can be defined here
    models.orders.hasMany(models.addresses, { foreignKey: 'orderId' });
    models.orders.hasMany(models.product, { foreignKey: 'id' });
    // models.orders.hasMany(models.payment, { foreignKey: 'orderCreationId' });  

  };
  return Order;
};