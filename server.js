require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, host, () => {
  console.log(`Serverul rulează la http://${host}:${port}`);
});
