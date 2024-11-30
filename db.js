const { Pool } = require('pg');

const pool = new Pool({
  user: 'shop_admin',
  host: 'localhost',
  database: 'shop_db',
  password: 'fDXCcej7zPdqH4dE',
  port: 5432, // PostgreSQL default port
});

module.exports = pool;
