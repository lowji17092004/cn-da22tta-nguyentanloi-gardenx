const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Status flow definitions
const STATUS_FLOW = {
  pending: { next: ['confirmed', 'cancelled'], label: 'Chờ xác nhận' },
  confirmed: { next: ['preparing', 'cancelled'], label: 'Đã xác nhận' },
  preparing: { next: ['shipping', 'cancelled'], label: 'Đang chuẩn bị' },
  shipping: { next: ['delivered'], label: 'Đang giao hàng' },
  delivered: { next: [], label: 'Đã giao thành công' },
  cancelled: { next: [], label: 'Đã hủy' }
};

const STATUS_NOTES = {
  confirmed: 'Đơn hàng đã được xác nhận',
  preparing: 'Đang chuẩn bị hàng',
  shipping: 'Đã giao cho đơn vị vận chuyển',
  delivered: 'Giao hàng thành công',
  cancelled: 'Đơn hàng đã bị hủy'
};

// create order
router.post('/', requireAuth, async (req, res) => {
  try{
    const { customerName, customerEmail, phone, address, items, total, notes } = req.body;
    
    // Kiểm tra và cập nhật số lượng tồn kho, lấy ảnh và tên sản phẩm
    const itemsWithImages = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm ${item.name || 'không xác định'} không tồn tại` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm trong kho` 
        });
      }
      
      // Giảm số lượng tồn kho
      product.stock -= item.quantity;
      await product.save();
      
      // Lưu thông tin item kèm ảnh và tên từ Product
      itemsWithImages.push({
        product: item.product,
        name: product.name, // Lấy tên từ Product database
        price: item.price || product.price,
        quantity: item.quantity,
        image: product.images?.[0] || '',
        reviewed: false
      });
    }
    
    // Calculate estimated delivery (3-5 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
    
    const o = new Order({ 
      user: req.user.userId,
      customerName, 
      customerEmail, 
      phone,
      address,
      items: itemsWithImages,
      total, 
      notes,
      estimatedDelivery
    });
    await o.save();
    res.json(o);
  }catch(err){ 
    res.status(500).json({ message: err.message }) 
  }
});

// admin list
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const list = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('items.product', 'name images price')
    .populate('statusHistory.updatedBy', 'name');
  res.json(list);
});

// get user's orders
router.get('/my-orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('statusHistory.updatedBy', 'name');
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// admin update status with history tracking
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Validate status transition
    const currentStatus = order.status;
    const allowedNextStatuses = STATUS_FLOW[currentStatus]?.next || [];
    
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Không thể chuyển từ "${STATUS_FLOW[currentStatus]?.label}" sang "${STATUS_FLOW[status]?.label}"` 
      });
    }
    
    // Update status
    order.status = status;
    
    // Add to history
    order.statusHistory.push({
      status,
      note: note || STATUS_NOTES[status],
      updatedBy: req.user.userId,
      updatedAt: new Date()
    });
    
    // Set delivered date if completed
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    // Set cancel reason if cancelled
    if (status === 'cancelled' && note) {
      order.cancelReason = note;
      
      // Restore stock for cancelled orders
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }
    
    await order.save();
    
    // Populate and return
    await order.populate('items.product');
    await order.populate('statusHistory.updatedBy', 'name');
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get available next statuses for an order
router.get('/:id/next-statuses', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    const nextStatuses = STATUS_FLOW[order.status]?.next || [];
    const statusOptions = nextStatuses.map(s => ({
      value: s,
      label: STATUS_FLOW[s]?.label
    }));
    
    res.json({ currentStatus: order.status, nextStatuses: statusOptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin delete order
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Restore stock if order was not cancelled or delivered
    if (order.status !== 'cancelled' && order.status !== 'delivered') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }
    
    await order.deleteOne();
    
    res.json({ message: 'Đã xóa đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
