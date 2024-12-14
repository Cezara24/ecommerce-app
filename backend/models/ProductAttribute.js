'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProductAttribute', {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    attributeId: { type: DataTypes.INTEGER, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false },
  }, {});
};
