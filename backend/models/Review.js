'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Review.belongsTo(models.Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
    }
  }

  Review.init(
    {
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
      comment: DataTypes.TEXT,
    },
    { sequelize, modelName: 'Review', tableName: 'Reviews' }
  );

  return Review;
};
