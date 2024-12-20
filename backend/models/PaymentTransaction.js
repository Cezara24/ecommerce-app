'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentTransaction extends Model {
    static associate(models) {
      PaymentTransaction.belongsTo(models.Order, { foreignKey: 'orderId', onDelete: 'CASCADE' });
    }
  }

  PaymentTransaction.init(
    {
      paymentStatus: { type: DataTypes.STRING, allowNull: false },
      paymentGateway: DataTypes.STRING,
      transactionId: DataTypes.STRING,
    },
    { sequelize, modelName: 'PaymentTransaction', tableName: 'PaymentTransactions' }
  );

  return PaymentTransaction;
};
