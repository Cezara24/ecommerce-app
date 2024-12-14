'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
    phoneNumber: DataTypes.STRING,
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verifiedAt: DataTypes.DATE,
    profilePicture: DataTypes.STRING,
  }, {});
};
