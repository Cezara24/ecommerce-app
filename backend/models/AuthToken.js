'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AuthToken', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: DataTypes.STRING,
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    isRevoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {});
};
