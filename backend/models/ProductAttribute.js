'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductAttribute extends Model {
    static associate(models) {
      ProductAttribute.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
      ProductAttribute.belongsTo(models.Attribute, { foreignKey: 'attributeId', onDelete: 'CASCADE' });
    }
  }

  ProductAttribute.init(
    {
      value: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, modelName: 'ProductAttribute', tableName: 'ProductAttributes' }
  );

  return ProductAttribute;
};
