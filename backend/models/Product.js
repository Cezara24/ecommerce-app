'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    description: DataTypes.TEXT,
    stock: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0 } },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    imageUrl: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
  }, {});
};
