const jwt = require('jsonwebtoken');
const { models } = require('../db');

const { AuthToken, User, Role, Permission } = models;

module.exports = {
  authMiddleware: async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
      const authToken = await AuthToken.findOne({ where: { token } });
      if (!authToken || authToken.isRevoked) {
        return res.status(403).json({ error: 'Invalid or revoked token.' });
      }
      if (new Date(authToken.expiresAt) < new Date()) {
        return res.status(403).json({ error: 'Token expired.' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, include: [Permission] }],
      });
      if (!user) {
        return res.status(404).json({ error: 'User does not exist.' });
      }
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.Role?.name,
        roleId: user.Role?.id,
        permissions: user.Role?.Permissions.map((perm) => perm.name),
      };
      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid or expired token.', details: error.message });
    }
  },
  permissionMiddleware: (requiredPermission) => (req, res, next) => {
    if (!req.user?.permissions.includes(requiredPermission)) {
      return res
        .status(403)
        .json({ error: `Access prohibited. Permission required: ${requiredPermission}.` });
    }
    next();
  },
  roleMiddleware: (allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res
        .status(403)
        .json({ error: `Access denied. Required role: ${allowedRoles.join(', ')}.` });
    }
    next();
  },
};
