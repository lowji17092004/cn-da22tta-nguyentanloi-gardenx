const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const UserCoupon = require('../models/UserCoupon');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get current user's coupons
router.get('/my-coupons', requireAuth, async (req, res) => {
  try {
    const userCoupons = await UserCoupon.find({ userId: req.user.userId })
      .populate({
        path: 'couponId',
        select: 'code description discount minOrder maxDiscount validTo active'
      })
      .sort({ createdAt: -1 });

    // Filter out null coupons (in case coupon was deleted)
    const validUserCoupons = userCoupons.filter(uc => uc.couponId);

    const formattedCoupons = validUserCoupons.map(uc => ({
      id: uc._id,
      code: uc.couponId.code,
      title: uc.couponId.description || 'Mã giảm giá',
      description: `Giảm ${uc.couponId.discount}%${uc.couponId.maxDiscount ? ` (tối đa ${new Intl.NumberFormat('vi-VN').format(uc.couponId.maxDiscount)}₫)` : ''}`,
      discountType: 'percentage',
      discountValue: uc.couponId.discount,
      minOrder: uc.couponId.minOrder,
      maxDiscount: uc.couponId.maxDiscount,
      used: uc.used,
      usedAt: uc.usedAt,
      expiryDate: uc.couponId.validTo,
      active: uc.couponId.active
    }));

    res.json(formattedCoupons);
  } catch (err) {
    console.error('Error fetching user coupons:', err);
    res.status(500).json({ message: err.message });
  }
});

// Save coupon to user's collection (each user can only save each coupon once)
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { couponId } = req.body;
    
    if (!couponId) {
      return res.status(400).json({ message: 'Vui lòng chọn mã giảm giá' });
    }
    
    // Check if coupon exists and is active
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });
    }
    
    if (!coupon.active) {
      return res.status(400).json({ message: 'Mã giảm giá không còn hoạt động' });
    }
    
    const now = new Date();
    if (coupon.validTo && coupon.validTo < now) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }
    
    // Check if user already saved this coupon
    const existingUserCoupon = await UserCoupon.findOne({
      userId: req.user.userId,
      couponId: couponId
    });
    
    if (existingUserCoupon) {
      return res.status(400).json({ message: 'Bạn đã lưu mã giảm giá này rồi' });
    }
    
    // Check coupon quantity
    if (coupon.quantity !== null && coupon.quantity !== undefined && coupon.quantity <= 0) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    }
    
    // Save coupon to user
    const userCoupon = new UserCoupon({
      userId: req.user.userId,
      couponId: couponId
    });
    
    await userCoupon.save();
    
    // Decrease quantity if applicable
    if (coupon.quantity !== null && coupon.quantity !== undefined) {
      coupon.quantity -= 1;
      await coupon.save();
    }
    
    res.json({ 
      message: 'Đã lưu mã giảm giá thành công!',
      userCoupon: {
        id: userCoupon._id,
        code: coupon.code,
        discount: coupon.discount,
        description: coupon.description,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        validTo: coupon.validTo
      }
    });
  } catch (err) {
    console.error('Error saving coupon:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Bạn đã lưu mã giảm giá này rồi' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Remove saved coupon
router.delete('/saved/:id', requireAuth, async (req, res) => {
  try {
    const userCoupon = await UserCoupon.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!userCoupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    
    if (userCoupon.used) {
      return res.status(400).json({ message: 'Không thể xóa mã đã sử dụng' });
    }
    
    // Restore coupon quantity
    const coupon = await Coupon.findById(userCoupon.couponId);
    if (coupon && coupon.quantity !== null && coupon.quantity !== undefined) {
      coupon.quantity += 1;
      await coupon.save();
    }
    
    await userCoupon.deleteOne();
    
    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (err) {
    console.error('Error removing saved coupon:', err);
    res.status(500).json({ message: err.message });
  }
});

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
      validTo: { $gte: now },
      $or: [
        { quantity: { $gt: 0 } },
        { quantity: null },
        { quantity: { $exists: false } }
      ]
    }).select('code description discount minOrder maxDiscount validFrom validTo quantity');
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
    
    // Check if user has this coupon assigned
    const userCoupon = await UserCoupon.findOne({ 
      userId: req.user.userId, 
      couponId: coupon._id 
    });
    
    if (!userCoupon) {
      return res.status(403).json({ message: 'Bạn chưa được cấp mã giảm giá này' });
    }
    
    if (userCoupon.used) {
      return res.status(400).json({ message: 'Mã giảm giá đã được sử dụng' });
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
      userCouponId: userCoupon._id,
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

// Assign coupon to users (admin only)
router.post('/assign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { couponId, userIds } = req.body; // userIds is an array
    
    if (!couponId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn mã giảm giá và người dùng' });
    }
    
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    
    const assignments = [];
    const errors = [];
    
    for (const userId of userIds) {
      try {
        // Check if already assigned
        const existing = await UserCoupon.findOne({ userId, couponId });
        if (existing) {
          errors.push({ userId, message: 'Đã được cấp mã này rồi' });
          continue;
        }
        
        const userCoupon = new UserCoupon({
          userId,
          couponId,
          assignedBy: req.user.userId
        });
        
        await userCoupon.save();
        await userCoupon.populate('userId', 'name email');
        assignments.push(userCoupon);
      } catch (err) {
        errors.push({ userId, message: err.message });
      }
    }
    
    res.json({
      message: `Đã cấp mã giảm giá cho ${assignments.length} người dùng`,
      assignments,
      errors
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark coupon as used (called by order creation)
router.post('/mark-used', requireAuth, async (req, res) => {
  try {
    const { userCouponId, orderId } = req.body;
    
    if (!userCouponId || !orderId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const userCoupon = await UserCoupon.findById(userCouponId);
    
    if (!userCoupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    
    if (userCoupon.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (userCoupon.used) {
      return res.status(400).json({ message: 'Mã giảm giá đã được sử dụng' });
    }
    
    userCoupon.used = true;
    userCoupon.usedAt = new Date();
    userCoupon.orderId = orderId;
    await userCoupon.save();
    
    // Increment used count on the coupon itself
    await Coupon.findByIdAndUpdate(userCoupon.couponId, {
      $inc: { usedCount: 1 }
    });
    
    res.json({ message: 'Đã áp dụng mã giảm giá', userCoupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign coupon to all users (admin only)
router.post('/assign-all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { couponId } = req.body;
    
    if (!couponId) {
      return res.status(400).json({ message: 'Vui lòng chọn mã giảm giá' });
    }
    
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    }
    
    const User = require('../models/User');
    const allUsers = await User.find({ role: { $ne: 'admin' } }).select('_id');
    
    const assignments = [];
    const errors = [];
    
    for (const user of allUsers) {
      try {
        // Check if already assigned
        const existing = await UserCoupon.findOne({ userId: user._id, couponId });
        if (existing) {
          continue; // Skip if already assigned
        }
        
        const userCoupon = new UserCoupon({
          userId: user._id,
          couponId,
          assignedBy: req.user.userId
        });
        
        await userCoupon.save();
        assignments.push(userCoupon);
      } catch (err) {
        errors.push({ userId: user._id, message: err.message });
      }
    }
    
    res.json({
      message: `Đã cấp mã giảm giá cho ${assignments.length} người dùng`,
      totalUsers: allUsers.length,
      assignedCount: assignments.length,
      errors
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
