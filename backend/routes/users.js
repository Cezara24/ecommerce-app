const express = require('express');
const { User, UserAddress, Role, Permission } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');
const bcrypt = require('bcrypt');

const router = express.Router();

// GET all users (Admin only)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('view_users'),
  async (req, res) => {
    try {
      const users = await User.findAll({ include: [Role, Permission] });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users', details: error.message });
    }
  }
);

// GET user by ID (Admin or the user themselves)
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'customer', 'merchant']),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, { include: [Role, Permission] });

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Customers can only view their own details
      if (
        req.user.role === 'customer' &&
        parseInt(req.params.id, 10) !== req.user.id
      ) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user', details: error.message });
    }
  }
);

// CREATE a new user (Admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('create_user'),
  async (req, res) => {
    const { name, email, password, roleId } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, roleId });

      res.status(201).json({ message: 'User created successfully!', user });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user', details: error.message });
    }
  }
);

// UPDATE user by ID (Admin or the user themselves)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'customer', 'merchant']),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Customers can only update their own details
      if (req.user.role === 'customer' && parseInt(req.params.id, 10) !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { name, email, password } = req.body;

      const updates = { name, email };
      if (password) updates.password = await bcrypt.hash(password, 10);

      await user.update(updates);

      res.json({ message: 'User updated successfully!', user });
    } catch (error) {
      res.status(500).json({ error: 'Error updating user', details: error.message });
    }
  }
);

// DELETE user by ID (Admin only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('delete_user'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) return res.status(404).json({ error: 'User not found' });

      await user.destroy();
      res.json({ message: 'User deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting user', details: error.message });
    }
  }
);

// GET addresses for a user (Admin or the user themselves)
router.get(
  '/:id/addresses',
  authMiddleware,
  roleMiddleware(['admin', 'customer']),
  permissionMiddleware('view_addresses'),
  async (req, res) => {
    try {
      const userAddresses = await UserAddress.findAll({ where: { userId: req.params.id } });

      if (req.user.role === 'customer' && parseInt(req.params.id, 10) !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(userAddresses);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching addresses', details: error.message });
    }
  }
);

// CREATE address for a user
router.post(
  '/:id/addresses',
  authMiddleware,
  roleMiddleware(['admin', 'customer']),
  permissionMiddleware('create_address'),
  async (req, res) => {
    try {
      const { addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

      if (req.user.role === 'customer' && parseInt(req.params.id, 10) !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const address = await UserAddress.create({
        userId: req.params.id,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        isDefault,
      });

      res.status(201).json({ message: 'Address created successfully!', address });
    } catch (error) {
      res.status(500).json({ error: 'Error creating address', details: error.message });
    }
  }
);

// DELETE address by ID (Admin or the user themselves)
router.delete(
  '/:id/addresses/:addressId',
  authMiddleware,
  roleMiddleware(['admin', 'customer']),
  permissionMiddleware('delete_address'),
  async (req, res) => {
    try {
      const address = await UserAddress.findByPk(req.params.addressId);

      if (!address) return res.status(404).json({ error: 'Address not found' });

      if (req.user.role === 'customer' && parseInt(req.params.id, 10) !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await address.destroy();
      res.json({ message: 'Address deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting address', details: error.message });
    }
  }
);

module.exports = router;
