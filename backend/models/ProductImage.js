'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProductImage', {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {});
};
