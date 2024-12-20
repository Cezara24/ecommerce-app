const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sequelize = require('../db');
const { Sequelize } = require('sequelize');

// Importă modelele
const User = require('../models/User')(sequelize, Sequelize.DataTypes);
const Role = require('../models/Role')(sequelize, Sequelize.DataTypes);
const Permission = require('../models/Permission')(sequelize, Sequelize.DataTypes);

// Middleware-uri
const { authMiddleware, roleMiddleware, permissionMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Înregistrare utilizator nou (rol implicit: 'customer')
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: 2, // Presupunând că 'customer' are roleId 2
    });
    res.status(201).json({ message: 'Utilizator înregistrat cu succes!' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la înregistrare', details: error.message });
  }
});

// Autentificare utilizator
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) return res.status(404).json({ error: 'Email sau parolă incorecte' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Email sau parolă incorecte' });

    const token = jwt.sign(
      { id: user.id, role: user.Role.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la autentificare', details: error.message });
  }
});

// Logout utilizator
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Delogat cu succes' });
});

// Asignare rol utilizator (doar admin)
router.post(
  '/assign-role/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('assign_role'),
  async (req, res) => {
    const { roleId } = req.body;
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'Utilizator inexistent' });

      await user.update({ roleId });
      res.json({ message: 'Rol asignat cu succes!' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la asignarea rolului', details: error.message });
    }
  }
);

// Obține detalii utilizator curent
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [Role, Permission] });
    if (!user) return res.status(404).json({ error: 'Utilizator inexistent' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name,
      permissions: user.Role.Permissions.map((perm) => perm.name),
    });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea detaliilor utilizatorului', details: error.message });
  }
});

module.exports = router;
