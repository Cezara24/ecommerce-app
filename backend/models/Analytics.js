'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Analytics extends Model {
    static associate(models) {
      Analytics.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'SET NULL' });
      Analytics.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'SET NULL' });
    }
  }

  Analytics.init(
    {
      action: DataTypes.STRING,
      timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      sessionId: DataTypes.STRING,
    },
    { sequelize, modelName: 'Analytics', tableName: 'Analytics' }
  );

  return Analytics;
};
