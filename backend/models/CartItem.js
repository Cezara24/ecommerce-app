'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CartItem', {
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  }, {});
};
