const jwt = require('jsonwebtoken');
const sequelize = require('../db');
const { Sequelize } = require('sequelize');

// Importă modelele
const User = require('../models/User')(sequelize, Sequelize.DataTypes);
const Role = require('../models/Role')(sequelize, Sequelize.DataTypes);
const Permission = require('../models/Permission')(sequelize, Sequelize.DataTypes);

// Definirea relațiilor
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });
Role.belongsToMany(Permission, { through: 'RolePermissions', foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: 'RolePermissions', foreignKey: 'permissionId' });

module.exports = {
  // Middleware pentru verificarea autentificării
  authMiddleware: async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Autentificare necesară.' });
    }

    try {
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
      res.status(403).json({ error: 'Token invalid sau expirat.' });
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
