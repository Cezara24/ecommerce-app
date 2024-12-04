const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email-ul este deja utilizat.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'Utilizator creat cu succes.', user });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea utilizatorului.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Parolă incorectă.' });
    }

    res.json({ message: 'Autentificare reușită.', user });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la autentificare.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea utilizatorilor.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea detaliilor utilizatorului.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
    }
    await user.destroy();
    res.json({ message: 'Utilizatorul a fost șters.' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea utilizatorului.' });
  }
});

module.exports = router;
