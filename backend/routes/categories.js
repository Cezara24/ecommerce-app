const express = require('express');
const { models } = require('../db');
const { Category } = models;
const { authMiddleware } = require("../middlewares/auth");
const { roleMiddleware } = require("../middlewares/role");
const { permissionMiddleware } = require("../middlewares/permission");

const router = express.Router();

// Obține toate categoriile
router.get('/', authMiddleware, permissionMiddleware('view_categories'), async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea categoriilor', details: error.message });
  }
});

// Obține o categorie după ID
router.get('/:id', authMiddleware, permissionMiddleware('view_category'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria nu a fost găsită' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea categoriei', details: error.message });
  }
});

// Creează o categorie nouă
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('create_category'),
  async (req, res) => {
    const { name, description } = req.body;
    try {
      const category = await Category.create({ name, description });
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea categoriei', details: error.message });
    }
  }
);

// Actualizează o categorie
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('update_category'),
  async (req, res) => {
    const { name, description } = req.body;
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) return res.status(404).json({ error: 'Categoria nu a fost găsită' });

      await category.update({ name, description });
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea categoriei', details: error.message });
    }
  }
);

// Șterge o categorie
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('delete_category'),
  async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) return res.status(404).json({ error: 'Categoria nu a fost găsită' });

      await category.destroy();
      res.json({ message: 'Categoria a fost ștearsă cu succes' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea categoriei', details: error.message });
    }
  }
);

module.exports = router;
