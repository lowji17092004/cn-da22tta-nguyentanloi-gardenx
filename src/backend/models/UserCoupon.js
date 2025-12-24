const mongoose = require('mongoose');

const userCouponSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin who assigned this coupon
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate assignments
userCouponSchema.index({ userId: 1, couponId: 1 }, { unique: true });

module.exports = mongoose.model('UserCoupon', userCouponSchema);
