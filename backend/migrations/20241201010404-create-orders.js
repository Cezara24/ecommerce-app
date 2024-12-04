'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      shippingAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentMethod: {
        type: Sequelize.ENUM('credit_card', 'paypal', 'cash_on_delivery'),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Orders');
  },
};
