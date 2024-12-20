'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserAddress extends Model {
    static associate(models) {
      UserAddress.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  UserAddress.init(
    {
      addressLine1: { type: DataTypes.STRING, allowNull: false },
      addressLine2: DataTypes.STRING,
      city: { type: DataTypes.STRING, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
      zipCode: { type: DataTypes.STRING, allowNull: false },
      country: { type: DataTypes.STRING, allowNull: false },
      isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'UserAddress', tableName: 'UserAddresses' }
  );

  return UserAddress;
};
