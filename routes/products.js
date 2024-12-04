const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea produselor.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, price, description, categoryId } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Categoria specificată nu a fost găsită.' });
    }

    const product = await Product.create({
      name,
      price,
      description,
      categoryId,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea produsului.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Category });
    if (!product) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea detaliilor produsului.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, price, description, categoryId } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit.' });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Categoria specificată nu a fost găsită.' });
      }
      product.categoryId = categoryId;
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea produsului.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit.' });
    }

    await product.destroy();
    res.json({ message: 'Produsul a fost șters.' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea produsului.' });
  }
});

module.exports = router;
