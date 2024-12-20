'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuthToken extends Model {
    static associate(models) {
      AuthToken.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  AuthToken.init(
    {
      token: { type: DataTypes.STRING, allowNull: false, unique: true },
      type: DataTypes.STRING,
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      isRevoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'AuthToken', tableName: 'AuthTokens' }
  );

  return AuthToken;
};
