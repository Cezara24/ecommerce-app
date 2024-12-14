'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {}

  Permission.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Permission',
    }
  );

  return Permission;
};
