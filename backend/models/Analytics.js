'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Analytics', {
    userId: DataTypes.INTEGER,
    action: DataTypes.STRING,
    productId: DataTypes.INTEGER,
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    sessionId: DataTypes.STRING,
  }, {});
};
