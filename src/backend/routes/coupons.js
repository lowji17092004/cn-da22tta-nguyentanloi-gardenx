const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get all coupons (admin only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get active coupons (for public display - optional)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      active: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }).select('code description discount minOrder validTo');
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate and apply coupon
router.post('/validate', requireAuth, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }
    
    // Check if coupon is valid
    const validityCheck = coupon.isValid();
    if (!validityCheck.valid) {
      return res.status(400).json({ message: validityCheck.message });
    }
    
    // Calculate discount
    const discountResult = coupon.calculateDiscount(orderTotal);
    if (!discountResult.valid) {
      return res.status(400).json({ message: discountResult.message });
    }
    
    res.json({
      couponId: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discount: coupon.discount,
      discountAmount: discountResult.discountAmount,
      finalTotal: orderTotal - discountResult.discountAmount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create coupon (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { code, description, discount, minOrder, maxDiscount, validFrom, validTo, usageLimit, active } = req.body;
    
    // Validate required fields
    if (!code || !discount || !validTo) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }
    
    // Check if code already exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });
    }
    
    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discount,
      minOrder: minOrder || 0,
      maxDiscount: maxDiscount || null,
      validFrom: validFrom || Date.now(),
      validTo,
      usageLimit: usageLimit || null,
      active: active !== undefined ? active : true,
      createdBy: req.user.userId
    });
    
    await coupon.save();
    await coupon.populate('createdBy', 'name email');
    
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update coupon (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { description, discount, minOrder, maxDiscount, validFrom, validTo, usageLimit, active } = req.body;
    
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    
    // Update fields
    if (description !== undefined) coupon.description = description;
    if (discount !== undefined) coupon.discount = discount;
    if (minOrder !== undefined) coupon.minOrder = minOrder;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (validFrom !== undefined) coupon.validFrom = validFrom;
    if (validTo !== undefined) coupon.validTo = validTo;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (active !== undefined) coupon.active = active;
    
    await coupon.save();
    await coupon.populate('createdBy', 'name email');
    
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete coupon (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    
    await coupon.deleteOne();
    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle active status (admin only)
router.patch('/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    
    coupon.active = !coupon.active;
    await coupon.save();
    
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
