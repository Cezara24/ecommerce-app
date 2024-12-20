'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserCoupon extends Model {
    static associate(models) {
      UserCoupon.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
      UserCoupon.belongsTo(models.Coupon, { foreignKey: 'couponId', onDelete: 'CASCADE' });
    }
  }

  UserCoupon.init(
    {
      redeemedAt: DataTypes.DATE,
    },
    { sequelize, modelName: 'UserCoupon', tableName: 'UserCoupons' }
  );

  return UserCoupon;
};
