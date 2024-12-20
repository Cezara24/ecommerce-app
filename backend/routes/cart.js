const express = require('express');
const sequelize = require('../db');
const { Sequelize } = require('sequelize');
const Cart = require('../models/Cart')(sequelize, Sequelize.DataTypes);
const CartItem = require('../models/CartItem')(sequelize, Sequelize.DataTypes);
const Product = require('../models/Product')(sequelize, Sequelize.DataTypes);
const { authMiddleware, permissionMiddleware } = require('../middlewares/auth');

const router = express.Router();

// Definirea relațiilor
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// Rute

// Obține toate produsele din coșul unui utilizator
router.get('/users/:id/cart', authMiddleware, permissionMiddleware('view_cart'), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const cart = await Cart.findOne({
      where: { userId: id },
      include: { model: CartItem, include: Product },
    });

    if (!cart) return res.status(404).json({ error: 'Coșul nu a fost găsit' });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea coșului', details: error.message });
  }
});

// Adaugă un produs în coșul utilizatorului
router.post('/users/:id/cart/items', authMiddleware, permissionMiddleware('manage_cart'), async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body;

    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const [cart] = await Cart.findOrCreate({ where: { userId: id } });
    const [cartItem] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId },
      defaults: { quantity },
    });

    if (!cartItem.isNewRecord) {
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    res.status(201).json({ message: 'Produs adăugat în coș' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la adăugarea produsului în coș', details: error.message });
  }
});

// Șterge tot coșul unui utilizator
router.delete('/users/:id/cart', authMiddleware, permissionMiddleware('delete_cart'), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const cart = await Cart.findOne({ where: { userId: id } });
    if (!cart) return res.status(404).json({ error: 'Coșul nu a fost găsit' });

    await CartItem.destroy({ where: { cartId: cart.id } });
    await cart.destroy();

    res.json({ message: 'Coșul a fost șters' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea coșului', details: error.message });
  }
});

module.exports = router;
