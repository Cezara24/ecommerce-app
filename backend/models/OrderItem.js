'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', onDelete: 'CASCADE' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
    }
  }

  OrderItem.init(
    {
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { sequelize, modelName: 'OrderItem', tableName: 'OrderItems' }
  );

  return OrderItem;
};
