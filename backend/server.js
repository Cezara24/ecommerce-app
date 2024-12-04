require('dotenv').config();
require('./models/associations');
const express = require('express');
const sequelize = require('./db');

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');

const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoryRoutes);

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
