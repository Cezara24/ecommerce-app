'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, { foreignKey: 'roleId', onDelete: 'CASCADE' });
      RolePermission.belongsTo(models.Permission, { foreignKey: 'permissionId', onDelete: 'CASCADE' });
    }
  }

  RolePermission.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Roles', key: 'id' },
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Permissions', key: 'id' },
      },
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'RolePermissions',
    }
  );

  return RolePermission;
};
