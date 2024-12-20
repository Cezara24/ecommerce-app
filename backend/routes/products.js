const express = require('express');
const sequelize = require('../db');
const { Sequelize } = require('sequelize');
const Product = require('../models/Product')(sequelize, Sequelize.DataTypes);
const Category = require('../models/Category')(sequelize, Sequelize.DataTypes);
const ProductImage = require('../models/ProductImage')(sequelize, Sequelize.DataTypes);
const Review = require('../models/Review')(sequelize, Sequelize.DataTypes);
const { authMiddleware, permissionMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Definirea relațiilor
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(ProductImage, { foreignKey: 'productId' });
Product.hasMany(Review, { foreignKey: 'productId' });

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
