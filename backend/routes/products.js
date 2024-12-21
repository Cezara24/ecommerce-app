const express = require('express');
const { models } = require('../db'); // Importă modelele centralizate din db.js
const { Product, Category, ProductImage, Review } = models; // Extrage modelele necesare
const { authMiddleware, permissionMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Rute

// Obține toate produsele
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category, ProductImage],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea produselor', details: error.message });
  }
});

// Creează un produs nou
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('create_product'),
  async (req, res) => {
    try {
      const { name, price, description, stock, sku, categoryId } = req.body;

      const product = await Product.create({
        name,
        price,
        description,
        stock,
        sku,
        categoryId,
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea produsului', details: error.message });
    }
  }
);

module.exports = router;
