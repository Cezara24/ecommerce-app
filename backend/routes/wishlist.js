const express = require('express');
const { Wishlist, Product, User } = require('../models');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

/**
 * GET /wishlist
 * Obține toate produsele din lista de dorințe a utilizatorului curent
 */
router.get('/', authMiddleware, permissionMiddleware('view_wishlist'), async (req, res) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
    });
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea listei de dorințe.', details: error.message });
  }
});

/**
 * POST /wishlist
 * Adaugă un produs în lista de dorințe a utilizatorului curent
 */
router.post('/', authMiddleware, permissionMiddleware('manage_wishlist'), async (req, res) => {
  const { productId } = req.body;
  try {
    const exists = await Wishlist.findOne({ where: { userId: req.user.id, productId } });
    if (exists) {
      return res.status(400).json({ error: 'Produsul există deja în lista de dorințe.' });
    }

    const wishlistItem = await Wishlist.create({
      userId: req.user.id,
      productId,
    });
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la adăugarea produsului în lista de dorințe.', details: error.message });
  }
});

/**
 * DELETE /wishlist/:productId
 * Șterge un produs din lista de dorințe a utilizatorului curent
 */
router.delete('/:productId', authMiddleware, permissionMiddleware('manage_wishlist'), async (req, res) => {
  const { productId } = req.params;
  try {
    const deleted = await Wishlist.destroy({
      where: { userId: req.user.id, productId },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit în lista de dorințe.' });
    }

    res.json({ message: 'Produsul a fost șters din lista de dorințe.' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea produsului din lista de dorințe.', details: error.message });
  }
});

module.exports = router;
