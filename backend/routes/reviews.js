const express = require('express');
const { Review, User, Product } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Obține toate recenziile pentru un produs
router.get('/products/:id/reviews', async (req, res) => {
  const productId = req.params.id;
  try {
    const reviews = await Review.findAll({
      where: { productId },
      include: [{ model: User, attributes: ['id', 'name'] }],
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea recenziilor.', details: error.message });
  }
});

// Creează o recenzie nouă
router.post(
  '/products/:id/reviews',
  authMiddleware,
  permissionMiddleware('create_review'),
  async (req, res) => {
    const productId = req.params.id;
    const { rating, comment } = req.body;

    try {
      const review = await Review.create({
        userId: req.user.id,
        productId,
        rating,
        comment,
      });
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea recenziei.', details: error.message });
    }
  }
);

// Șterge o recenzie
router.delete(
  '/products/:id/reviews/:reviewId',
  authMiddleware,
  async (req, res) => {
    const { id: productId, reviewId } = req.params;

    try {
      const review = await Review.findOne({
        where: { id: reviewId, productId },
      });

      if (!review) {
        return res.status(404).json({ error: 'Recenzia nu a fost găsită.' });
      }

      // Permite ștergerea doar pentru autor sau admin
      if (review.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acces interzis.' });
      }

      await review.destroy();
      res.json({ message: 'Recenzia a fost ștearsă cu succes.' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea recenziei.', details: error.message });
    }
  }
);

module.exports = router;
