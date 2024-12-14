'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Coupon', {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    discount: { type: DataTypes.DECIMAL(5, 2), allowNull: false, validate: { min: 0 } },
    usageLimit: { type: DataTypes.INTEGER, validate: { min: 0 } },
  }, {});
};
