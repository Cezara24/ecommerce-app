const express = require('express');
const router = express.Router();
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Importă instanța Sequelize

// Importă modelele
const Role = require('../models/Role')(sequelize, DataTypes);
const Permission = require('../models/Permission')(sequelize, DataTypes);
const RolePermission = require('../models/RolePermission')(sequelize, DataTypes);
const User = require('../models/User')(sequelize, DataTypes);
const UserAddress = require('../models/UserAddress')(sequelize, DataTypes);

// Exemplu de endpoint GET pentru a verifica funcționalitatea
router.get('/', async (req, res) => {
  try {
    const coupons = await Permission.findAll(); // Exemplu cu un model
    res.status(200).json(coupons);
  } catch (error) {
    console.error('Eroare la obținerea datelor:', error);
    res.status(500).json({ error: 'Eroare la obținerea datelor' });
  }
});

// Endpoint POST - Seed database (exemplu)
router.post('/seed', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // 1. Crearea rolurilor
    const roles = await Role.bulkCreate([
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'customer', description: 'Regular customer' },
      { name: 'merchant', description: 'Merchant who sells products' },
    ], { transaction });

    // 2. Crearea permisiunilor
    const permissionsList = [
      'view_analytics', 'create_analytics_event', 'delete_analytics_event',
      'assign_role', 'view_cart', 'manage_cart', 'delete_cart',
      'view_categories', 'view_category', 'create_category', 'update_category', 'delete_category',
      'view_coupons', 'view_coupon', 'create_coupon', 'update_coupon', 'delete_coupon', 'redeem_coupon',
      'create_notification', 'delete_notification',
      'view_orders', 'view_order', 'create_order', 'update_order', 'delete_order',
      'manage_orders', 'view_transactions',
      'create_product', 'view_reviews', 'create_review', 'delete_review',
      'view_roles', 'create_role', 'update_role', 'delete_role',
      'view_permissions', 'create_permission', 'assign_permission', 'revoke_permission',
      'view_users', 'create_user', 'delete_user', 'view_addresses',
      'view_wishlist', 'manage_wishlist'
    ];
    const permissions = await Permission.bulkCreate(
      permissionsList.map(name => ({ name, description: `Permission for ${name}` })),
      { transaction }
    );

    // 3. Maparea permisiunilor pentru fiecare rol
    const adminRole = roles.find(r => r.name === 'admin');
    const rolePermissions = permissions.map(p => ({
      roleId: adminRole.id,
      permissionId: p.id,
    }));

    await RolePermission.bulkCreate(rolePermissions, { transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Seed completed successfully!' });
  } catch (error) {
    await transaction.rollback();
    console.error('Seed failed:', error);
    res.status(500).json({ error: 'Seed failed', details: error.message });
  }
});

module.exports = router;
