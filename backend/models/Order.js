'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Order', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['pending', 'shipped', 'completed', 'cancelled']] },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    addressId: { type: DataTypes.INTEGER, allowNull: false },
    paymentMethod: DataTypes.STRING,
    couponId: DataTypes.INTEGER,
  }, {});
};
