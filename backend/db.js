const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: process.env.DEBUG === 'true',
  }
);

// Definirea modelelor
const Role = require('./models/Role')(sequelize, Sequelize.DataTypes);
const Permission = require('./models/Permission')(sequelize, Sequelize.DataTypes);
const RolePermission = require('./models/RolePermission')(sequelize, Sequelize.DataTypes);
const User = require('./models/User')(sequelize, Sequelize.DataTypes);
const UserAddress = require('./models/UserAddress')(sequelize, Sequelize.DataTypes);
const Category = require('./models/Category')(sequelize, Sequelize.DataTypes);
const Product = require('./models/Product')(sequelize, Sequelize.DataTypes);
const ProductImage = require('./models/ProductImage')(sequelize, Sequelize.DataTypes);
const Attribute = require('./models/Attribute')(sequelize, Sequelize.DataTypes);
const ProductAttribute = require('./models/ProductAttribute')(sequelize, Sequelize.DataTypes);
const Cart = require('./models/Cart')(sequelize, Sequelize.DataTypes);
const CartItem = require('./models/CartItem')(sequelize, Sequelize.DataTypes);
const Wishlist = require('./models/Wishlist')(sequelize, Sequelize.DataTypes);
const Review = require('./models/Review')(sequelize, Sequelize.DataTypes);
const Coupon = require('./models/Coupon')(sequelize, Sequelize.DataTypes);
const Order = require('./models/Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./models/OrderItem')(sequelize, Sequelize.DataTypes);
const PaymentTransaction = require('./models/PaymentTransaction')(sequelize, Sequelize.DataTypes);
const Notification = require('./models/Notification')(sequelize, Sequelize.DataTypes);
const Analytics = require('./models/Analytics')(sequelize, Sequelize.DataTypes);
const AuthToken = require('./models/AuthToken')(sequelize, Sequelize.DataTypes);
const UserCoupon = require('./models/UserCoupon')(sequelize, Sequelize.DataTypes);

// Asociază modelele
Role.associate({ User, Permission, RolePermission });
Permission.associate({ Role, RolePermission });
RolePermission.associate({ Role, Permission });
User.associate({ Role, UserAddress, Cart, Review, Wishlist, Notification, Analytics, AuthToken, UserCoupon, Order });
UserAddress.associate({ User });
Category.associate({ Product, Attribute });
Product.associate({ Category, ProductImage, Attribute, ProductAttribute });
ProductImage.associate({ Product });
Attribute.associate({ Category, ProductAttribute });
ProductAttribute.associate({ Product, Attribute });
Coupon.associate({ Order, UserCoupon });
Order.associate({ User, OrderItem, Coupon, UserAddress });
OrderItem.associate({ Order, Product });
Cart.associate({ User, CartItem });
CartItem.associate({ Cart, Product });
Wishlist.associate({ User, Product });
Review.associate({ User, Product });
PaymentTransaction.associate({ Order });
UserCoupon.associate({ User, Coupon });
Notification.associate({ User });
Analytics.associate({ User, Product });
AuthToken.associate({ User });

// Exportă instanța Sequelize și modelele
const models = {
  Role,
  Permission,
  RolePermission,
  User,
  UserAddress,
  Category,
  Product,
  ProductImage,
  Attribute,
  ProductAttribute,
  Cart,
  CartItem,
  Wishlist,
  Review,
  Coupon,
  Order,
  OrderItem,
  PaymentTransaction,
  UserCoupon,
  Notification,
  Analytics,
  AuthToken,
};

module.exports = { sequelize, models };
