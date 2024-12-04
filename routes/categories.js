const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea categoriilor.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea categoriei.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria nu a fost găsită.' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea categoriei.' });
  }
});

router.get('/:id/products', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: Product,
    });
    if (!category) {
      return res.status(404).json({ error: 'Categoria nu a fost găsită.' });
    }
    res.json(category.Products);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea produselor din categorie.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria nu a fost găsită.' });
    }
    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea categoriei.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria nu a fost găsită.' });
    }
    await category.destroy();
    res.json({ message: 'Categoria a fost ștearsă.' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea categoriei.' });
  }
});

module.exports = router;
