'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define('bill', {
    storeId: DataTypes.INTEGER,
    customerName: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    customerPhone: DataTypes.STRING,
    products: DataTypes.JSON,
    subtotal: DataTypes.DECIMAL(10, 2),
    discount: DataTypes.DECIMAL(10, 2),
    tax: DataTypes.DECIMAL(10, 2),
    total: DataTypes.DECIMAL(10, 2),
    notes: DataTypes.TEXT,
  }, {});
  Bill.associate = function(models) {
    // associations can be defined here
    models.bill.belongsTo(models.store, { foreignKey: 'storeId' });
    models.bill.belongsTo(models.vendor, { foreignKey: 'storeId', as: 'vendor' });
  };
  return Bill;
};

