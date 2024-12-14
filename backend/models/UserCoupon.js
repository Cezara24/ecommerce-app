'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserCoupon', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    couponId: { type: DataTypes.INTEGER, allowNull: false },
    redeemedAt: DataTypes.DATE,
  }, {});
};
