const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Autentificare necesară' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, include: [Permission] }],
    });

    if (!user) return res.status(404).json({ error: 'Utilizator inexistent' });

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.Role?.name,
      permissions: user.Role?.Permissions.map((perm) => perm.name),
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token invalid' });
  }
};
