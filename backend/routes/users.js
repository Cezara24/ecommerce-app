const express = require('express');
const { models } = require('../db'); // Importă modelele centralizate
const { User, UserAddress, Role, Permission } = models; // Extrage modelele necesare
const authMiddleware = require('../middlewares/auth').authMiddleware;
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');
const bcrypt = require('bcrypt');

const router = express.Router();

// GET all users (Admin only)
router.get(
  '/',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('view_users')],
  async (req, res) => {
    try {
      const users = await User.findAll({ include: [Role] });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea utilizatorilor.', details: error.message });
    }
  }
);

// GET user by ID (Admin or the user themselves)
router.get(
  '/:id',
  [authMiddleware, roleMiddleware(['admin', 'customer', 'merchant'])],
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, { include: [Role, Permission] });

      if (!user) return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });

      if (req.user.role === 'customer' && parseInt(req.params.id, 10) !== req.user.id) {
        return res.status(403).json({ error: 'Acces interzis.' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea utilizatorului.', details: error.message });
    }
  }
);

// CREATE a new user (Admin only)
router.post(
  '/',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('create_user')],
  async (req, res) => {
    const { name, email, password, roleId } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, roleId });

      res.status(201).json({ message: 'Utilizator creat cu succes!', user });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea utilizatorului.', details: error.message });
    }
  }
);

// UPDATE user by ID (Admin or the user themselves)
router.put(
  '/:id',
  [authMiddleware, roleMiddleware(['admin', 'customer', 'merchant'])],
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });

      if (req.user.role === 'customer' && parseInt(req.params.id, 10) !== req.user.id) {
        return res.status(403).json({ error: 'Acces interzis.' });
      }

      const { name, email, password } = req.body;

      const updates = { name, email };
      if (password) updates.password = await bcrypt.hash(password, 10);

      await user.update(updates);

      res.json({ message: 'Utilizator actualizat cu succes!', user });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea utilizatorului.', details: error.message });
    }
  }
);

// DELETE user by ID (Admin only)
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('delete_user')],
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });

      await user.destroy();
      res.json({ message: 'Utilizator șters cu succes!' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea utilizatorului.', details: error.message });
    }
  }
);

// GET addresses for a user (Admin or the user themselves)
router.get(
  '/:id/addresses',
  [authMiddleware, roleMiddleware(['admin', 'customer']), permissionMiddleware('view_addresses')],
  async (req, res) => {
    try {
      const userAddresses = await UserAddress.findAll({ where: { userId: req.params.id } });

      if (req.user.role === 'customer' && parseInt(req.params.id, 10) !== req.user.id) {
        return res.status(403).json({ error: 'Acces interzis.' });
      }

      res.json(userAddresses);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea adreselor utilizatorului.', details: error.message });
    }
  }
);

module.exports = router;
