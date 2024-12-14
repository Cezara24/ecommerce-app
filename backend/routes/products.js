const express = require('express');
const { Product, Category, ProductImage, Review, Attribute, ProductAttribute } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

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

// Obține un produs după ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Category, ProductImage, Review],
    });
    if (!product) return res.status(404).json({ error: 'Produs inexistent' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea produsului', details: error.message });
  }
});

// Creează un produs nou
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'merchant']),
  permissionMiddleware('create_product'),
  async (req, res) => {
    const { name, price, description, stock, sku, categoryId, imageUrl, isFeatured } = req.body;
    try {
      const product = await Product.create({
        name,
        price,
        description,
        stock,
        sku,
        categoryId,
        imageUrl,
        isFeatured,
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea produsului', details: error.message });
    }
  }
);

// Actualizează un produs existent
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'merchant']),
  permissionMiddleware('update_product'),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produs inexistent' });

      const updatedProduct = await product.update(req.body);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea produsului', details: error.message });
    }
  }
);

// Șterge un produs
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'merchant']),
  permissionMiddleware('delete_product'),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produs inexistent' });

      await product.destroy();
      res.json({ message: 'Produs șters cu succes' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea produsului', details: error.message });
    }
  }
);

// Adaugă o imagine la un produs
router.post(
  '/:id/images',
  authMiddleware,
  roleMiddleware(['admin', 'merchant']),
  permissionMiddleware('manage_product_images'),
  async (req, res) => {
    const { imageUrl, isPrimary } = req.body;
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produs inexistent' });

      const image = await ProductImage.create({
        productId: product.id,
        imageUrl,
        isPrimary,
      });
      res.status(201).json(image);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la adăugarea imaginii', details: error.message });
    }
  }
);

// Șterge o imagine a unui produs
router.delete(
  '/:id/images/:imageId',
  authMiddleware,
  roleMiddleware(['admin', 'merchant']),
  permissionMiddleware('manage_product_images'),
  async (req, res) => {
    try {
      const image = await ProductImage.findByPk(req.params.imageId);
      if (!image) return res.status(404).json({ error: 'Imagine inexistentă' });

      await image.destroy();
      res.json({ message: 'Imagine ștearsă cu succes' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea imaginii', details: error.message });
    }
  }
);

// Adaugă un atribut unui produs
router.post(
  '/:id/attributes',
  authMiddleware,
  roleMiddleware(['admin', 'merchant']),
  permissionMiddleware('manage_product_attributes'),
  async (req, res) => {
    const { attributeId, value } = req.body;
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produs inexistent' });

      const attribute = await ProductAttribute.create({
        productId: product.id,
        attributeId,
        value,
      });
      res.status(201).json(attribute);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la adăugarea atributului', details: error.message });
    }
  }
);

// Șterge un atribut al unui produs
router.delete(
  '/:id/attributes/:attributeId',
  authMiddleware,
  roleMiddleware(['admin', 'merchant']),
  permissionMiddleware('manage_product_attributes'),
  async (req, res) => {
    try {
      const attribute = await ProductAttribute.findOne({
        where: {
          productId: req.params.id,
          attributeId: req.params.attributeId,
        },
      });
      if (!attribute) return res.status(404).json({ error: 'Atribut inexistent' });

      await attribute.destroy();
      res.json({ message: 'Atribut șters cu succes' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea atributului', details: error.message });
    }
  }
);

module.exports = router;
