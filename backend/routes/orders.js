const express = require('express');
const { models } = require('../db'); // Importă modelele centralizate
const { authMiddleware } = require('../middlewares/auth'); // Asigură-te că sunt importate corect
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Destructurare pentru a accesa modelele necesare
const { Order, OrderItem, PaymentTransaction, Product } = models;

// Obține toate comenzile
router.get(
  '/',
  [authMiddleware, roleMiddleware(['admin', 'merchant', 'customer']), permissionMiddleware('view_orders')],
  async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [OrderItem, PaymentTransaction],
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea comenzilor.', details: error.message });
    }
  }
);

// Obține o comandă după ID
router.get(
  '/:id',
  [authMiddleware, roleMiddleware(['admin', 'merchant', 'customer']), permissionMiddleware('view_order')],
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [OrderItem, PaymentTransaction],
      });
      if (!order) {
        return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea comenzii.', details: error.message });
    }
  }
);

// Creează o comandă nouă
router.post(
  '/',
  [authMiddleware, roleMiddleware(['customer']), permissionMiddleware('create_order')],
  async (req, res) => {
    const { userId, status, totalAmount, addressId, paymentMethod, couponId, items } = req.body;

    try {
      const order = await Order.create({
        userId,
        status,
        totalAmount,
        addressId,
        paymentMethod,
        couponId,
      });

      const orderItems = items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      await OrderItem.bulkCreate(orderItems);

      res.status(201).json({ message: 'Comanda a fost creată cu succes!', order });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la crearea comenzii.', details: error.message });
    }
  }
);

// Actualizează o comandă
router.put(
  '/:id',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('update_order')],
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
      }

      await order.update(req.body);
      res.json({ message: 'Comanda a fost actualizată cu succes.', order });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea comenzii.', details: error.message });
    }
  }
);

// Șterge o comandă
router.delete(
  '/:id',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('delete_order')],
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
      }

      await order.destroy();
      res.json({ message: 'Comanda a fost ștearsă cu succes.' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea comenzii.', details: error.message });
    }
  }
);

// Obține produsele dintr-o comandă
router.get(
  '/:id/items',
  [authMiddleware, roleMiddleware(['admin', 'merchant', 'customer']), permissionMiddleware('view_orders')],
  async (req, res) => {
    try {
      const items = await OrderItem.findAll({
        where: { orderId: req.params.id },
        include: [Product],
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea produselor comenzii.', details: error.message });
    }
  }
);

// Adaugă produse într-o comandă
router.post(
  '/:id/items',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('manage_orders')],
  async (req, res) => {
    const { items } = req.body;

    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
      }

      const orderItems = items.map((item) => ({
        orderId: req.params.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      await OrderItem.bulkCreate(orderItems);
      res.json({ message: 'Produsele au fost adăugate cu succes în comandă.' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la adăugarea produselor în comandă.', details: error.message });
    }
  }
);

// Șterge un produs dintr-o comandă
router.delete(
  '/:id/items/:itemId',
  [authMiddleware, roleMiddleware(['admin']), permissionMiddleware('manage_orders')],
  async (req, res) => {
    try {
      const item = await OrderItem.findByPk(req.params.itemId);
      if (!item || item.orderId !== parseInt(req.params.id, 10)) {
        return res.status(404).json({ error: 'Produsul nu a fost găsit în această comandă.' });
      }

      await item.destroy();
      res.json({ message: 'Produsul a fost șters din comandă.' });
    } catch (error) {
      res.status(500).json({ error: 'Eroare la ștergerea produsului din comandă.', details: error.message });
    }
  }
);

// Obține tranzacțiile unei comenzi
router.get(
  '/:id/transactions',
  [authMiddleware, roleMiddleware(['admin', 'customer']), permissionMiddleware('view_transactions')],
  async (req, res) => {
    try {
      const transactions = await PaymentTransaction.findAll({
        where: { orderId: req.params.id },
      });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la obținerea tranzacțiilor comenzii.', details: error.message });
    }
  }
);

module.exports = router;
