require('dotenv').config();
require('./models/associations');
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const errorHandler = require('./middlewares/errorHandler');
const loadRoutes = require('./utils/loadRoutes');
const passport = require('./config/passport');

// Inițializează aplicația
const app = express();

// Middleware pentru Passport.js
app.use(passport.initialize());

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Încarcă toate rutele
loadRoutes(app, './routes');

// Middleware pentru tratarea erorilor
app.use(errorHandler);

// Configurații server
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date a reușit.');

    await sequelize.sync({ alter: true });
    console.log('Modelele sunt sincronizate cu baza de date.');

    app.listen(port, host, () => {
      console.log(`Serverul rulează pe http://${host}:${port}`);
    });
  } catch (error) {
    console.error('Eroare la conectarea la baza de date sau pornirea serverului:', error);
  }
})();
