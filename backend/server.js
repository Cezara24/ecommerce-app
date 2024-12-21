const express = require('express');
const cors = require('cors');
const { sequelize, models } = require('./db'); // Importă instanța Sequelize centralizată
const errorHandler = require('./middlewares/errorHandler');
const passport = require('./config/passport');

const app = express();

// Middleware global pentru logarea cererilor
app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.originalUrl}`);
  next();
});

// Middleware pentru Passport.js
app.use(passport.initialize());

// Middleware-uri pentru Express și CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Importă rutele
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth', require('./routes/auth')); // Modelele sunt disponibile aici
app.use('/api/cart', require('./routes/cart'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/permissions', require('./routes/permissions'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wishlist', require('./routes/wishlist'));

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
