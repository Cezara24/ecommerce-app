'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
      Product.hasMany(models.ProductImage, { foreignKey: 'productId', onDelete: 'CASCADE' });
    }
  }

  Product.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    },
    { sequelize, modelName: 'Product', tableName: 'Products' }
  );

  return Product;
};
