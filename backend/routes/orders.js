const express = require('express');
const { Order, OrderItem, Product, UserAddress, Coupon, PaymentTransaction } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Get all orders
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('view_orders'),
  async (req, res) => {
    try {
      const orders = await Order.findAll({
        include: [OrderItem, PaymentTransaction],
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
  }
);

// Get order by ID
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('view_order'),
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [OrderItem, PaymentTransaction],
      });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching order', details: error.message });
    }
  }
);

// Create a new order
router.post(
  '/',
  authMiddleware,
  permissionMiddleware('create_order'),
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

      res.status(201).json({ message: 'Order created successfully!', order });
    } catch (error) {
      res.status(500).json({ error: 'Error creating order', details: error.message });
    }
  }
);

// Update an order
router.put(
  '/:id',
  authMiddleware,
  permissionMiddleware('update_order'),
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      await order.update(req.body);
      res.json({ message: 'Order updated successfully', order });
    } catch (error) {
      res.status(500).json({ error: 'Error updating order', details: error.message });
    }
  }
);

// Delete an order
router.delete(
  '/:id',
  authMiddleware,
  permissionMiddleware('delete_order'),
  async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      await order.destroy();
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting order', details: error.message });
    }
  }
);

// Get items for an order
router.get(
  '/:id/items',
  authMiddleware,
  permissionMiddleware('view_orders'),
  async (req, res) => {
    try {
      const items = await OrderItem.findAll({ where: { orderId: req.params.id } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching order items', details: error.message });
    }
  }
);

// Add items to an order
router.post(
  '/:id/items',
  authMiddleware,
  permissionMiddleware('manage_orders'),
  async (req, res) => {
    const { items } = req.body;

    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const orderItems = items.map((item) => ({
        orderId: req.params.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      await OrderItem.bulkCreate(orderItems);
      res.json({ message: 'Items added to order successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error adding items to order', details: error.message });
    }
  }
);

// Delete an item from an order
router.delete(
  '/:id/items/:itemId',
  authMiddleware,
  permissionMiddleware('manage_orders'),
  async (req, res) => {
    try {
      const item = await OrderItem.findByPk(req.params.itemId);
      if (!item || item.orderId !== parseInt(req.params.id, 10)) {
        return res.status(404).json({ error: 'Item not found in the order' });
      }

      await item.destroy();
      res.json({ message: 'Item removed from order' });
    } catch (error) {
      res.status(500).json({ error: 'Error removing item from order', details: error.message });
    }
  }
);

// Get payment transactions for an order
router.get(
  '/:id/transactions',
  authMiddleware,
  permissionMiddleware('view_transactions'),
  async (req, res) => {
    try {
      const transactions = await PaymentTransaction.findAll({ where: { orderId: req.params.id } });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching transactions', details: error.message });
    }
  }
);

module.exports = router;
