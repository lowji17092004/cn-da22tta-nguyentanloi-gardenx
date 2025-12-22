const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100 // Phần trăm giảm giá (0-100%)
  },
  minOrder: {
    type: Number,
    default: 0 // Giá trị đơn hàng tối thiểu để áp dụng
  },
  maxDiscount: {
    type: Number,
    default: null // Số tiền giảm tối đa (null = không giới hạn)
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validTo: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null // Số lần sử dụng tối đa (null = không giới hạn)
  },
  usedCount: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 100,
    min: 0 // Số lượng mã giảm giá có sẵn
  },
  active: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    default: null // Category for organizing coupons
  },
  subcategory: {
    type: String,
    default: null // Subcategory for organizing coupons
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  if (!this.active) {
    return { valid: false, message: 'Mã giảm giá không còn hiệu lực' };
  }
  
  if (now < this.validFrom) {
    return { valid: false, message: 'Mã giảm giá chưa có hiệu lực' };
  }
  
  if (now > this.validTo) {
    return { valid: false, message: 'Mã giảm giá đã hết hạn' };
  }
  
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
  }
  
  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderTotal) {
  if (orderTotal < this.minOrder) {
    return { 
      valid: false, 
      message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(this.minOrder)}₫ để áp dụng mã này` 
    };
  }
  
  let discountAmount = (orderTotal * this.discount) / 100;
  
  if (this.maxDiscount && discountAmount > this.maxDiscount) {
    discountAmount = this.maxDiscount;
  }
  
  return {
    valid: true,
    discountAmount: Math.round(discountAmount),
    discountPercent: this.discount
  };
};

module.exports = mongoose.model('Coupon', couponSchema);
