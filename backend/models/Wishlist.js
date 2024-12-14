'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Wishlist', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
  }, {});
};
