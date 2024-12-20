require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const errorHandler = require('./middlewares/errorHandler');
const passport = require('./config/passport');

// Importă rutele
const analyticsRoute = require('./routes/analytics');
const authRoute = require('./routes/auth');
const cartRoute = require('./routes/cart');
const categoriesRoute = require('./routes/categories');
const couponsRoute = require('./routes/coupons');
const notificationsRoute = require('./routes/notifications');
const ordersRoute = require('./routes/orders');
const permissionsRoute = require('./routes/permissions');
const productsRoute = require('./routes/products');
const reviewsRoute = require('./routes/reviews');
const rolesRoute = require('./routes/roles');
const usersRoute = require('./routes/users');
const wishlistRoute = require('./routes/wishlist');

// Inițializează Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log, // Setează `false` pentru a dezactiva logurile SQL
});

// Încarcă modelele
const models = {
  User: require('./models/User')(sequelize, Sequelize.DataTypes),
  Role: require('./models/Role')(sequelize, Sequelize.DataTypes),
  Permission: require('./models/Permission')(sequelize, Sequelize.DataTypes),
  RolePermission: require('./models/RolePermission')(sequelize, Sequelize.DataTypes),
  UserAddress: require('./models/UserAddress')(sequelize, Sequelize.DataTypes),
  Category: require('./models/Category')(sequelize, Sequelize.DataTypes),
  Product: require('./models/Product')(sequelize, Sequelize.DataTypes),
  ProductImage: require('./models/ProductImage')(sequelize, Sequelize.DataTypes),
  Attribute: require('./models/Attribute')(sequelize, Sequelize.DataTypes),
  ProductAttribute: require('./models/ProductAttribute')(sequelize, Sequelize.DataTypes),
  Order: require('./models/Order')(sequelize, Sequelize.DataTypes),
  OrderItem: require('./models/OrderItem')(sequelize, Sequelize.DataTypes),
  Cart: require('./models/Cart')(sequelize, Sequelize.DataTypes),
  CartItem: require('./models/CartItem')(sequelize, Sequelize.DataTypes),
  Review: require('./models/Review')(sequelize, Sequelize.DataTypes),
  Wishlist: require('./models/Wishlist')(sequelize, Sequelize.DataTypes),
  PaymentTransaction: require('./models/PaymentTransaction')(sequelize, Sequelize.DataTypes),
  Coupon: require('./models/Coupon')(sequelize, Sequelize.DataTypes),
  Notification: require('./models/Notification')(sequelize, Sequelize.DataTypes),
  Analytics: require('./models/Analytics')(sequelize, Sequelize.DataTypes),
  AuthToken: require('./models/AuthToken')(sequelize, Sequelize.DataTypes),
  UserCoupon: require('./models/UserCoupon')(sequelize, Sequelize.DataTypes),
};

// Definește asocierile între modele
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Adaugă modelele și sequelize la contextul aplicației (opțional)
const db = { sequelize, Sequelize, models };

// Inițializează aplicația
const app = express();

// Middleware pentru Passport.js
app.use(passport.initialize());

// Middleware-uri pentru Express și CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Încarcă manual rutele
app.use('/api/analytics', analyticsRoute);
app.use('/api/auth', authRoute);
app.use('/api/cart', cartRoute);
app.use('/api/categories', categoriesRoute);
app.use('/api/coupons', couponsRoute);
app.use('/api/notifications', notificationsRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/permissions', permissionsRoute);
app.use('/api/products', productsRoute);
app.use('/api/reviews', reviewsRoute);
app.use('/api/roles', rolesRoute);
app.use('/api/users', usersRoute);
app.use('/api/wishlist', wishlistRoute);

// Middleware pentru tratarea erorilor
app.use(errorHandler);

// Configurații server
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// Pornirea serverului și conectarea la baza de date
(async () => {
  try {
    // Autentifică conexiunea la baza de date
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date a reușit.');

    // Sincronizează toate modelele cu baza de date
    await sequelize.sync({ alter: true });
    console.log('Modelele sunt sincronizate cu baza de date.');

    // Pornește serverul
    app.listen(port, host, () => {
      console.log(`Serverul rulează pe http://${host}:${port}`);
    });
  } catch (error) {
    console.error('Eroare la conectarea la baza de date sau pornirea serverului:', error);
  }
})();
