'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, { foreignKey: 'cartId', onDelete: 'CASCADE' });
      CartItem.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
    }
  }

  CartItem.init(
    {
      quantity: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, modelName: 'CartItem', tableName: 'CartItems' }
  );

  return CartItem;
};
