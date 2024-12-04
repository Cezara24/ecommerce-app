const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Product = require('./Product');
const User = require('./User');

Order.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });

OrderItem.belongsTo(Order, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

module.exports = {
  Order,
  OrderItem,
  Product,
  User,
};
