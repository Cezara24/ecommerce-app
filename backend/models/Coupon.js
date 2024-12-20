'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.UserCoupon, { foreignKey: 'couponId', onDelete: 'CASCADE' });
    }
  }

  Coupon.init(
    {
      code: { type: DataTypes.STRING, allowNull: false, unique: true },
      discount: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
      usageLimit: DataTypes.INTEGER,
    },
    { sequelize, modelName: 'Coupon', tableName: 'Coupons' }
  );

  return Coupon;
};
