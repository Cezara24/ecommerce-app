'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
    }
  }

  ProductImage.init(
    {
      imageUrl: { type: DataTypes.STRING, allowNull: false },
      isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'ProductImage', tableName: 'ProductImages' }
  );

  return ProductImage;
};
