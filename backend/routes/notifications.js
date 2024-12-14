const express = require('express');
const { Notification } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// GET all notifications for a user
router.get('/users/:id/notifications', authMiddleware, async (req, res) => {
  const { id } = req.params;

  // Check if the user is authorized to view notifications
  if (req.user.id !== parseInt(id, 10) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acces interzis.' });
  }

  try {
    const notifications = await Notification.findAll({ where: { userId: id } });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea notificărilor.', details: error.message });
  }
});

// CREATE a notification for a user
router.post(
  '/users/:id/notifications',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('create_notification'),
  async (req, res) => {
    const { id } = req.params;
    const { message, type } = req.body;

    try {
      const notification = await Notification.create({
        userId: id,
        message,
        type,
      });
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea notificării.', details: error.message });
    }
  }
);

// UPDATE a notification (mark as read)
router.put(
  '/users/:id/notifications/:notificationId',
  authMiddleware,
  async (req, res) => {
    const { id, notificationId } = req.params;

    if (req.user.id !== parseInt(id, 10) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acces interzis.' });
    }

    try {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        return res.status(404).json({ error: 'Notificare inexistentă.' });
      }

      await notification.update({ isRead: true });
      res.json({ message: 'Notificarea a fost marcată ca citită.' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea notificării.', details: error.message });
    }
  }
);

// DELETE a notification
router.delete(
  '/users/:id/notifications/:notificationId',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('delete_notification'),
  async (req, res) => {
    const { notificationId } = req.params;

    try {
      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        return res.status(404).json({ error: 'Notificare inexistentă.' });
      }

      await notification.destroy();
      res.json({ message: 'Notificarea a fost ștearsă cu succes.' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea notificării.', details: error.message });
    }
  }
);

module.exports = router;
