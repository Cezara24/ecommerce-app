'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      description: {
        type: Sequelize.TEXT,
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      sku: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      imageUrl: {
        type: Sequelize.STRING,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('Products', ['sku'], { name: 'idx_products_sku' });
    await queryInterface.addIndex('Products', ['categoryId'], { name: 'idx_products_categoryId' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  },
};
