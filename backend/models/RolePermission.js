'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {}

  RolePermission.init(
    {
      roleId: { type: DataTypes.INTEGER, allowNull: false },
      permissionId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'RolePermission',
    }
  );

  return RolePermission;
};
