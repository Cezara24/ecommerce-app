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

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date a reușit.');
  } catch (error) {
    console.error('Eroare la conectarea la baza de date:', error);
  }
})();

module.exports = sequelize;
