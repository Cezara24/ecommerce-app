'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attribute extends Model {
    static associate(models) {
      Attribute.belongsTo(models.Category, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
      Attribute.hasMany(models.ProductAttribute, { foreignKey: 'attributeId', onDelete: 'CASCADE' });
    }
  }

  Attribute.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, modelName: 'Attribute', tableName: 'Attributes' }
  );

  return Attribute;
};
