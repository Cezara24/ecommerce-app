const express = require('express');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, shippingAddress, paymentMethod, items } = req.body;

    const order = await Order.create({
      userId,
      shippingAddress,
      paymentMethod,
    });

    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Produsul cu ID ${item.productId} nu a fost găsit.` });
        }
        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    await order.update({ totalAmount });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea comenzii.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { userId, status, startDate, endDate } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    const orders = await Order.findAll({
      where,
      include: { model: OrderItem, include: Product },
    });
    res.json(orders);
  } catch (error) {
    console.error('Eroare capturată în ruta GET /orders:', error);
    res.status(500).json({ error: 'Eroare la obținerea comenzilor.' });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { 
          model: OrderItem, 
          include: Product
        }
      ],
    });
    if (!order) {
      return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
    }
    res.json(order);
  } catch (error) {
    console.error('Eroare capturată în ruta GET /orders/:id :', error);
    res.status(500).json({ error: 'Eroare la obținerea comenzii.' });
  }
});



router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
    }
    order.status = status || order.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea comenzii.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
    }
    await order.destroy();
    res.json({ message: 'Comanda a fost ștearsă.' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea comenzii.' });
  }
});

module.exports = router;
