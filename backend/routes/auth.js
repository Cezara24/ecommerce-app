const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Role, Permission } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

const router = express.Router();

// Register a new user with the role 'customer' by default
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: 2, // Assuming 'customer' has roleId 2
    });
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) return res.status(404).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.Role.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
});

// Google login: Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback: Handle Google authentication response
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      let user = await User.findOne({ where: { email: req.user.emails[0].value } });

      if (!user) {
        user = await User.create({
          name: req.user.displayName,
          email: req.user.emails[0].value,
          roleId: 2, // Default to 'customer'
          isVerified: true,
          profilePicture: req.user.photos[0]?.value,
        });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
    } catch (error) {
      res.status(500).json({ error: 'Google authentication failed', details: error.message });
    }
  }
);

// Logout user
router.post('/logout', authMiddleware, (req, res) => {
  // For stateless JWT, "logout" can simply be managed client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

// Assign a role to a user (Admin only)
router.put('/assign-role/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { roleId } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ roleId });
    res.json({ message: `Role assigned to user successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Error assigning role', details: error.message });
  }
});

// Get current user details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [Role, Permission] });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role.name,
      permissions: user.Role.Permissions.map((perm) => perm.name),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user details', details: error.message });
  }
});

module.exports = router;
