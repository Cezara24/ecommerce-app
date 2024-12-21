const jwt = require('jsonwebtoken');
const { models } = require('../db');

const { AuthToken, User, Role, Permission } = models;

module.exports = {
  authMiddleware: async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Autentificare necesară.' });
    }

    try {
      // Verifică token-ul în baza de date
      const authToken = await AuthToken.findOne({ where: { token } });
      if (!authToken || authToken.isRevoked) {
        return res.status(403).json({ error: 'Token invalid sau revocat.' });
      }

      // Verifică expirarea token-ului
      if (new Date(authToken.expiresAt) < new Date()) {
        return res.status(403).json({ error: 'Token expirat.' });
      }

      // Decodifică token-ul
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, include: [Permission] }],
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilizator inexistent.' });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role?.name,
        permissions: user.Role?.Permissions.map((perm) => perm.name),
      };
      next();
    } catch (error) {
      res.status(403).json({ error: 'Token invalid sau expirat.', details: error.message });
    }
  },

  // Middleware pentru verificarea permisiunilor
  permissionMiddleware: (requiredPermission) => (req, res, next) => {
    if (!req.user?.permissions.includes(requiredPermission)) {
      return res
        .status(403)
        .json({ error: `Acces interzis. Permisiunea necesară: ${requiredPermission}.` });
    }
    next();
  },

  // Middleware pentru verificarea rolurilor
  roleMiddleware: (allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res
        .status(403)
        .json({ error: `Acces interzis. Rol necesar: ${allowedRoles.join(', ')}.` });
    }
    next();
  },
};
