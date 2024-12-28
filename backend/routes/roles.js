const express = require('express');
const { models } = require('../db');
const { Role, Permission, RolePermission } = models;
const { authMiddleware } = require("../middlewares/auth");
const { roleMiddleware } = require("../middlewares/role");
const { permissionMiddleware } = require("../middlewares/permission");

const router = express.Router();

// Obține toate rolurile (Admin only)
router.get(
  '/',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('view_roles')],
  async (req, res) => {
    try {
      const roles = await Role.findAll({
        include: {
          model: Permission,
          through: { attributes: [] }, // Exclude legătura din răspuns
        },
      });
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea rolurilor', details: error.message });
    }
  }
);

// Creează un rol nou (Admin only)
router.post(
  '/',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('create_role')],
  async (req, res) => {
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

      res.status(201).json({ message: 'Rol creat cu succes', role });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea rolului', details: error.message });
    }
  }
);

// Actualizează un rol existent (Admin only)
router.put(
  '/:id',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('update_role')],
  async (req, res) => {
    const { name, description, permissions } = req.body;
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) {
        return res.status(404).json({ error: 'Rolul nu a fost găsit' });
      }

      await role.update({ name, description });

      if (permissions && Array.isArray(permissions)) {
        await RolePermission.destroy({ where: { roleId: role.id } });
        const rolePermissions = permissions.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        }));
        await RolePermission.bulkCreate(rolePermissions);
      }

      res.json({ message: 'Rol actualizat cu succes', role });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea rolului', details: error.message });
    }
  }
);

// Șterge un rol (Admin only)
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('delete_role')],
  async (req, res) => {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) {
        return res.status(404).json({ error: 'Rolul nu a fost găsit' });
      }

      await role.destroy();
      res.json({ message: 'Rol șters cu succes' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea rolului', details: error.message });
    }
  }
);

// Obține toate permisiunile (Admin only)
router.get(
  '/permissions',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('view_permissions')],
  async (req, res) => {
    try {
      const permissions = await Permission.findAll();
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea permisiunilor', details: error.message });
    }
  }
);

// Creează o permisiune nouă (Admin only)
router.post(
  '/permissions',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('create_permission')],
  async (req, res) => {
    const { name, description } = req.body;
    try {
      const permission = await Permission.create({ name, description });
      res.status(201).json({ message: 'Permisiune creată cu succes', permission });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea permisiunii', details: error.message });
    }
  }
);

// Atribuie o permisiune unui rol (Admin only)
router.post(
  '/:id/permissions',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('assign_permission')],
  async (req, res) => {
    const { permissionId } = req.body;
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) {
        return res.status(404).json({ error: 'Rolul nu a fost găsit' });
      }

      const permission = await Permission.findByPk(permissionId);
      if (!permission) {
        return res.status(404).json({ error: 'Permisiunea nu a fost găsită' });
      }

      await RolePermission.create({ roleId: role.id, permissionId });
      res.json({ message: 'Permisiune atribuită cu succes rolului' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la atribuirea permisiunii', details: error.message });
    }
  }
);

// Revocă o permisiune de la un rol (Admin only)
router.delete(
  '/:id/permissions/:permissionId',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('revoke_permission')],
  async (req, res) => {
    try {
      const rolePermission = await RolePermission.findOne({
        where: { roleId: req.params.id, permissionId: req.params.permissionId },
      });

      if (!rolePermission) {
        return res.status(404).json({ error: 'Permisiunea nu este asociată cu rolul' });
      }

      await rolePermission.destroy();
      res.json({ message: 'Permisiune revocată cu succes' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la revocarea permisiunii', details: error.message });
    }
  }
);

module.exports = router;
