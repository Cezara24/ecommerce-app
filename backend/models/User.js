'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'roleId', onDelete: 'SET NULL' });
      User.hasMany(models.UserAddress, { foreignKey: 'userId', onDelete: 'CASCADE' });
      User.hasMany(models.Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
      User.hasOne(models.Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
      User.hasMany(models.Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
      User.hasMany(models.Wishlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
      User.hasMany(models.Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
      User.hasMany(models.Analytics, { foreignKey: 'userId', onDelete: 'SET NULL' });
      User.hasMany(models.AuthToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
      User.hasMany(models.UserCoupon, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: DataTypes.STRING,
      roleId: DataTypes.INTEGER,
      phoneNumber: DataTypes.STRING,
      isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      verifiedAt: DataTypes.DATE,
      profilePicture: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
    }
  );

  return User;
};
