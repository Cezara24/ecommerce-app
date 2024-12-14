const express = require('express');
const { Permission } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Obține toate permisiunile (doar admin)
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea permisiunilor', details: error.message });
  }
});

// Creează o nouă permisiune (doar admin)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { name, description } = req.body;
  try {
    const permission = await Permission.create({ name, description });
    res.status(201).json({ message: 'Permisiune creată cu succes', permission });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea permisiunii', details: error.message });
  }
});

// Actualizează o permisiune existentă (doar admin)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { name, description } = req.body;
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permisiune inexistentă' });
    }
    await permission.update({ name, description });
    res.json({ message: 'Permisiune actualizată cu succes', permission });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea permisiunii', details: error.message });
  }
});

// Șterge o permisiune (doar admin)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const permission = await Permission.findByPk(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permisiune inexistentă' });
    }
    await permission.destroy();
    res.json({ message: 'Permisiune ștearsă cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea permisiunii', details: error.message });
  }
});

// Atribuie o permisiune unui rol (doar admin)
router.post(
  '/assign',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { roleId, permissionId } = req.body;
    try {
      const rolePermission = await RolePermission.create({ roleId, permissionId });
      res.status(201).json({ message: 'Permisiune atribuită cu succes rolului', rolePermission });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la atribuirea permisiunii', details: error.message });
    }
  }
);

// Revocă o permisiune de la un rol (doar admin)
router.delete(
  '/revoke',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    const { roleId, permissionId } = req.body;
    try {
      const rolePermission = await RolePermission.findOne({ where: { roleId, permissionId } });
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
