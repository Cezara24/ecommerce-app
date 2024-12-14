const express = require('express');
const { Category } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Get all categories
router.get('/', authMiddleware, permissionMiddleware('view_categories'), async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
});

// Get a category by ID
router.get('/:id', authMiddleware, permissionMiddleware('view_category'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category', details: error.message });
  }
});

// Create a new category
router.post('/', authMiddleware, roleMiddleware(['admin']), permissionMiddleware('create_category'), async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category', details: error.message });
  }
});

// Update a category
router.put('/:id', authMiddleware, roleMiddleware(['admin']), permissionMiddleware('update_category'), async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.update({ name, description });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category', details: error.message });
  }
});

// Delete a category
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), permissionMiddleware('delete_category'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category', details: error.message });
  }
});

module.exports = router;
