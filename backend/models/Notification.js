'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  Notification.init(
    {
      message: { type: DataTypes.TEXT, allowNull: false },
      type: DataTypes.STRING,
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'Notification', tableName: 'Notifications' }
  );

  return Notification;
};
