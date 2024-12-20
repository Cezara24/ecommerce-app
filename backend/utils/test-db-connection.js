console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const sequelize = require('../db');

(async () => {
  try {
    console.log('Se încearcă conectarea la baza de date...');
    await sequelize.authenticate();
    console.log('Conexiunea la baza de date a fost realizată cu succes!');
    process.exit(0);
  } catch (error) {
    console.error('Eroare la conectarea la baza de date:', error.message);
    process.exit(1);
  }
})();
