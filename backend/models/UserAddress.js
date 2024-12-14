'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserAddress', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    addressLine1: { type: DataTypes.STRING, allowNull: false },
    addressLine2: DataTypes.STRING,
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    zipCode: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {});
};
