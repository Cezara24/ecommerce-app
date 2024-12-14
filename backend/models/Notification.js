'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Notification', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: DataTypes.STRING,
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {});
};
