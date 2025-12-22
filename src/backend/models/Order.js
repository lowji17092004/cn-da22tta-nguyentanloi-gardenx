const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'],
    required: true 
  },
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  customerEmail: String,
  phone: String,
  address: String,
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      reviewed: { type: Boolean, default: false }
    }
  ],
  total: Number,
  notes: String,
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'qr', 'zalopay'], 
    default: 'zalopay' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  statusHistory: [statusHistorySchema],
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelReason: String,
  coupon: {
    code: String,
    discount: Number, // Phần trăm giảm giá
    discountAmount: Number // Số tiền thực tế giảm
  },
  subtotal: Number, // Tổng tiền trước khi giảm giá
  discount: Number // Tổng số tiền giảm giá
}, { timestamps: true });

// Auto add initial status to history
orderSchema.pre('save', function(next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: 'pending',
      note: 'Đơn hàng đã được tạo',
      updatedAt: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
