const express = require('express');
const pool = require('./db');

const app = express();
const port = 3000;

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
