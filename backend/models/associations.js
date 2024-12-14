const User = require('./User');
const UserAddress = require('./UserAddress');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Attribute = require('./Attribute');
const ProductAttribute = require('./ProductAttribute');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const PaymentTransaction = require('./PaymentTransaction');
const Coupon = require('./Coupon');
const Notification = require('./Notification');
const Analytics = require('./Analytics');
const AuthToken = require('./AuthToken');
const UserCoupon = require('./UserCoupon');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');

// Definirea relațiilor

// Definirea relațiilor pentru Roluri și Permisiuni
Role.hasMany(User, { foreignKey: 'roleId', onDelete: 'SET NULL' });
User.belongsTo(Role, { foreignKey: 'roleId' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
});

RolePermission.belongsTo(Role, { foreignKey: 'roleId', onDelete: 'CASCADE' });
RolePermission.belongsTo(Permission, { foreignKey: 'permissionId', onDelete: 'CASCADE' });

// User -> UserAddress
User.hasMany(UserAddress, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserAddress.belongsTo(User, { foreignKey: 'userId' });

// Category -> Product
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Product -> ProductImage
Product.hasMany(ProductImage, { foreignKey: 'productId', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

// Category -> Attribute
Category.hasMany(Attribute, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Attribute.belongsTo(Category, { foreignKey: 'categoryId' });

// Product -> ProductAttribute
Product.hasMany(ProductAttribute, { foreignKey: 'productId', onDelete: 'CASCADE' });
ProductAttribute.belongsTo(Product, { foreignKey: 'productId' });
Attribute.hasMany(ProductAttribute, { foreignKey: 'attributeId', onDelete: 'CASCADE' });
ProductAttribute.belongsTo(Attribute, { foreignKey: 'attributeId' });

// User -> Order
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order -> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// User -> Cart
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Cart -> CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// User -> Review
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// User -> Wishlist
User.hasMany(Wishlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// Order -> PaymentTransaction
Order.hasOne(PaymentTransaction, { foreignKey: 'orderId', onDelete: 'CASCADE' });
PaymentTransaction.belongsTo(Order, { foreignKey: 'orderId' });

// User -> Notification
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User -> Analytics
User.hasMany(Analytics, { foreignKey: 'userId', onDelete: 'SET NULL' });
Analytics.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Analytics, { foreignKey: 'productId', onDelete: 'SET NULL' });
Analytics.belongsTo(Product, { foreignKey: 'productId' });

// User -> AuthToken
User.hasMany(AuthToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
AuthToken.belongsTo(User, { foreignKey: 'userId' });

// User -> UserCoupon
User.hasMany(UserCoupon, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserCoupon.belongsTo(User, { foreignKey: 'userId' });
Coupon.hasMany(UserCoupon, { foreignKey: 'couponId', onDelete: 'CASCADE' });
UserCoupon.belongsTo(Coupon, { foreignKey: 'couponId' });

module.exports = {
    User,
    UserAddress,
    Category,
    Product,
    ProductImage,
    Attribute,
    ProductAttribute,
    Order,
    OrderItem,
    Cart,
    CartItem,
    Review,
    Wishlist,
    PaymentTransaction,
    Coupon,
    Notification,
    Analytics,
    AuthToken,
    UserCoupon,
    Role,
    Permission,
    RolePermission,
  };