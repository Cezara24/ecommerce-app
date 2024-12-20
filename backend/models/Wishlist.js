'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Wishlist.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
    }
  }

  Wishlist.init(
    {},
    { sequelize, modelName: 'Wishlist', tableName: 'Wishlist' }
  );

  return Wishlist;
};
