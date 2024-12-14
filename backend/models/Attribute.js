'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Attribute', {
    name: { type: DataTypes.STRING, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
  }, {});
};
