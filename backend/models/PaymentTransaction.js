'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PaymentTransaction', {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['pending', 'completed', 'failed']] },
    },
    paymentGateway: DataTypes.STRING,
    transactionId: DataTypes.STRING,
  }, {});
};
