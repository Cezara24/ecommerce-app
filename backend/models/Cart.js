'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });
    }
  }

  Cart.init({}, { sequelize, modelName: 'Cart', tableName: 'Cart' });

  return Cart;
};
