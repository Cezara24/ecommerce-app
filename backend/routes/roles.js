const express = require('express');
const { Role, Permission, RolePermission } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Get all roles (Admin only)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: {
        model: Permission,
        through: { attributes: [] },
      },
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles', details: error.message });
  }
});

// Create a new role (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { name, description, permissions } = req.body;
  try {
    const role = await Role.create({ name, description });

    if (permissions && Array.isArray(permissions)) {
      const rolePermissions = permissions.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }

    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role', details: error.message });
  }
});

// Update an existing role (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { name, description, permissions } = req.body;
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });

    await role.update({ name, description });

    if (permissions && Array.isArray(permissions)) {
      await RolePermission.destroy({ where: { roleId: role.id } });
      const rolePermissions = permissions.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }

    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role', details: error.message });
  }
});

// Delete a role (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });

    await role.destroy();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role', details: error.message });
  }
});

// Get all permissions (Admin only)
router.get('/permissions', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions', details: error.message });
  }
});

// Create a new permission (Admin only)
router.post('/permissions', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { name, description } = req.body;
  try {
    const permission = await Permission.create({ name, description });
    res.status(201).json({ message: 'Permission created successfully', permission });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create permission', details: error.message });
  }
});

// Assign a permission to a role (Admin only)
router.post('/:id/permissions', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { permissionId } = req.body;
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const permission = await Permission.findByPk(permissionId);
    if (!permission) return res.status(404).json({ error: 'Permission not found' });

    await RolePermission.create({ roleId: role.id, permissionId });
    res.json({ message: 'Permission assigned to role successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign permission', details: error.message });
  }
});

// Revoke a permission from a role (Admin only)
router.delete('/:id/permissions/:permissionId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const rolePermission = await RolePermission.findOne({
      where: { roleId: req.params.id, permissionId: req.params.permissionId },
    });

    if (!rolePermission) return res.status(404).json({ error: 'Permission not assigned to role' });

    await rolePermission.destroy();
    res.json({ message: 'Permission revoked from role successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke permission', details: error.message });
  }
});

module.exports = router;
