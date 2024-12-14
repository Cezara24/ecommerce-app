'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    // Metode adiționale pot fi adăugate aici dacă este nevoie
  }

  Role.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Role', // Numele modelului trebuie să fie consistent
    }
  );

  return Role;
};
