const express = require('express');
const { Cart, CartItem, Product } = require('../models');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

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

    const cart = await Cart.findOrCreate({ where: { userId: id } });
    const cartItem = await CartItem.findOne({ where: { cartId: cart[0].id, productId } });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      await CartItem.create({ cartId: cart[0].id, productId, quantity });
    }

    res.status(201).json({ message: 'Produs adăugat în coș' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la adăugarea produsului în coș', details: error.message });
  }
});

// Actualizează cantitatea unui produs din coș
router.put('/users/:id/cart/items/:itemId', authMiddleware, permissionMiddleware('manage_cart'), async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { quantity } = req.body;

    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const cartItem = await CartItem.findByPk(itemId);

    if (!cartItem || cartItem.cartId !== id) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit în coș' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ message: 'Cantitatea produsului a fost actualizată' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea cantității', details: error.message });
  }
});

// Șterge un produs din coș
router.delete('/users/:id/cart/items/:itemId', authMiddleware, permissionMiddleware('manage_cart'), async (req, res) => {
  try {
    const { id, itemId } = req.params;

    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const cartItem = await CartItem.findByPk(itemId);

    if (!cartItem || cartItem.cartId !== id) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit în coș' });
    }

    await cartItem.destroy();
    res.json({ message: 'Produsul a fost șters din coș' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea produsului din coș', details: error.message });
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
