const express = require('express');
const { models } = require('../db'); // Importă modelele centralizate din db.js
const { authMiddleware, permissionMiddleware } = require('../middlewares/auth');

const { Cart, CartItem, Product } = models; // Extrage modelele necesare

const router = express.Router();

// Rute

// Obține toate produsele din coșul unui utilizator
router.get('/users/:id/cart', authMiddleware, permissionMiddleware('view_cart'), async (req, res) => {
  try {
    const { id } = req.params;

    // Permisiuni: utilizatorul poate vedea doar propriul coș, cu excepția adminilor
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    const cart = await Cart.findOne({
      where: { userId: id },
      include: { model: CartItem, include: Product }, // Include produsele din coș
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

    // Permisiuni: utilizatorul poate gestiona doar propriul coș
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    // Găsește sau creează coșul utilizatorului
    const [cart] = await Cart.findOrCreate({ where: { userId: id } });

    // Găsește sau creează un articol în coș
    const [cartItem] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId },
      defaults: { quantity },
    });

    // Dacă articolul există deja, actualizează cantitatea
    if (!cartItem.isNewRecord) {
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    res.status(201).json({ message: 'Produs adăugat în coș', cartItem });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la adăugarea produsului în coș', details: error.message });
  }
});

// Șterge tot coșul unui utilizator
router.delete('/users/:id/cart', authMiddleware, permissionMiddleware('delete_cart'), async (req, res) => {
  try {
    const { id } = req.params;

    // Permisiuni: utilizatorul poate șterge doar propriul coș sau adminii
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acces interzis' });
    }

    // Găsește coșul utilizatorului
    const cart = await Cart.findOne({ where: { userId: id } });
    if (!cart) return res.status(404).json({ error: 'Coșul nu a fost găsit' });

    // Șterge articolele din coș și coșul
    await CartItem.destroy({ where: { cartId: cart.id } });
    await cart.destroy();

    res.json({ message: 'Coșul a fost șters' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea coșului', details: error.message });
  }
});

module.exports = router;
