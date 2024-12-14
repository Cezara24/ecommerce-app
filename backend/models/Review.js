'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Review', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: DataTypes.TEXT,
  }, {});
};
