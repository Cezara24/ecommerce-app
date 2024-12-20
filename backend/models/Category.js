'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
    }
  }

  Category.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'Categories',
    }
  );

  return Category;
};
