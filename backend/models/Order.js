'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Order.belongsTo(models.Coupon, { foreignKey: 'couponId', onDelete: 'SET NULL' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
    }
  }

  Order.init(
    {
      status: { type: DataTypes.STRING, allowNull: false },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { sequelize, modelName: 'Order', tableName: 'Orders' }
  );

  return Order;
};
