const express = require('express');
const { Coupon, UserCoupon } = require('../models');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const permissionMiddleware = require('../middlewares/permission');

const router = express.Router();

// Get all coupons
router.get(
  '/',
  authMiddleware,
  permissionMiddleware('view_coupons'),
  async (req, res) => {
    try {
      const coupons = await Coupon.findAll();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving coupons', details: error.message });
    }
  }
);

// Get a coupon by ID
router.get(
  '/:id',
  authMiddleware,
  permissionMiddleware('view_coupons'),
  async (req, res) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

      res.json(coupon);
    } catch (error) {
      res.status(500).json({ error: 'Error retrieving the coupon', details: error.message });
    }
  }
);

// Create a new coupon
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('create_coupon'),
  async (req, res) => {
    const { code, discount, usageLimit } = req.body;
    try {
      const coupon = await Coupon.create({ code, discount, usageLimit });
      res.status(201).json({ message: 'Coupon created successfully', coupon });
    } catch (error) {
      res.status(500).json({ error: 'Error creating the coupon', details: error.message });
    }
  }
);

// Update a coupon
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('update_coupon'),
  async (req, res) => {
    const { code, discount, usageLimit } = req.body;
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

      await coupon.update({ code, discount, usageLimit });
      res.json({ message: 'Coupon updated successfully', coupon });
    } catch (error) {
      res.status(500).json({ error: 'Error updating the coupon', details: error.message });
    }
  }
);

// Delete a coupon
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  permissionMiddleware('delete_coupon'),
  async (req, res) => {
    try {
      const coupon = await Coupon.findByPk(req.params.id);
      if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

      await coupon.destroy();
      res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting the coupon', details: error.message });
    }
  }
);

// Redeem a coupon
router.post(
  '/:id/redeem',
  authMiddleware,
  permissionMiddleware('redeem_coupon'),
  async (req, res) => {
    const { id: couponId } = req.params;
    const { user } = req;

    try {
      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

      const alreadyRedeemed = await UserCoupon.findOne({
        where: { userId: user.id, couponId },
      });
      if (alreadyRedeemed)
        return res.status(400).json({ error: 'Coupon already redeemed' });

      const userCoupon = await UserCoupon.create({
        userId: user.id,
        couponId,
        redeemedAt: new Date(),
      });

      res.json({ message: 'Coupon redeemed successfully', userCoupon });
    } catch (error) {
      res.status(500).json({ error: 'Error redeeming the coupon', details: error.message });
    }
  }
);

module.exports = router;
