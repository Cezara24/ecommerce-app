const express = require('express');
const { Analytics, User, Product } = require('../models');
const authMiddleware = require('../middlewares/auth');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Obține toate datele de analiză (Admin)
router.get('/', authMiddleware, permissionMiddleware('view_analytics'), async (req, res) => {
  try {
    const analyticsData = await Analytics.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Product, attributes: ['id', 'name'] },
      ],
    });
    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea datelor de analiză.', details: error.message });
  }
});

// Creează un eveniment de analiză (Admin, Merchant)
router.post('/', authMiddleware, permissionMiddleware('create_analytics_event'), async (req, res) => {
  const { userId, action, productId, sessionId } = req.body;

  try {
    const event = await Analytics.create({
      userId,
      action,
      productId,
      sessionId,
    });
    res.status(201).json({ message: 'Eveniment de analiză creat cu succes!', event });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea evenimentului de analiză.', details: error.message });
  }
});

// Obține evenimentele de analiză ale unui utilizator (Admin, User propriu)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  if (req.user.role !== 'admin' && req.user.id !== parseInt(userId, 10)) {
    return res.status(403).json({ error: 'Acces interzis.' });
  }

  try {
    const userAnalytics = await Analytics.findAll({
      where: { userId },
      include: { model: Product, attributes: ['id', 'name'] },
    });
    res.json(userAnalytics);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea evenimentelor de analiză.', details: error.message });
  }
});

// Șterge un eveniment de analiză (Admin)
router.delete('/:id', authMiddleware, permissionMiddleware('delete_analytics_event'), async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Analytics.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: 'Eveniment de analiză inexistent.' });
    }

    await event.destroy();
    res.json({ message: 'Eveniment de analiză șters cu succes!' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea evenimentului de analiză.', details: error.message });
  }
});

module.exports = router;
