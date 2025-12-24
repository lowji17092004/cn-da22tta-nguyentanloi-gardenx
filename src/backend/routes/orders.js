const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Message = require('../models/Message');
const Coupon = require('../models/Coupon');
const { requireAuth, requireAdmin, requireAdminOrCollaborator } = require('../middleware/auth');

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
    const { customerName, customerEmail, phone, address, items, total, notes, coupon, paymentMethod, paymentStatus } = req.body;
    
    // Kiểm tra và cập nhật số lượng tồn kho, lấy ảnh và tên sản phẩm
    const itemsWithImages = [];
    let subtotal = 0;
    
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
      
      const itemPrice = item.price || product.price;
      subtotal += itemPrice * item.quantity;
      
      // Lưu thông tin item kèm ảnh và tên từ Product
      itemsWithImages.push({
        product: item.product,
        name: product.name, // Lấy tên từ Product database
        price: itemPrice,
        quantity: item.quantity,
        image: product.images?.[0] || '',
        reviewed: false
      });
    }
    
    // Handle coupon if provided (from frontend validation)
    let couponData = null;
    let discountAmount = 0;
    
    if (coupon && coupon.code) {
      // Coupon already validated by frontend, just store the info
      couponData = {
        code: coupon.code,
        discountAmount: coupon.discountAmount
      };
      discountAmount = coupon.discountAmount;
      
      // Mark user coupon as used
      if (coupon.userCouponId) {
        const UserCoupon = require('../models/UserCoupon');
        const userCoupon = await UserCoupon.findById(coupon.userCouponId);
        if (userCoupon && !userCoupon.used) {
          userCoupon.used = true;
          userCoupon.usedAt = new Date();
          await userCoupon.save();
          
          // Increment coupon used count
          const Coupon = require('../models/Coupon');
          await Coupon.findByIdAndUpdate(userCoupon.couponId, {
            $inc: { usedCount: 1 }
          });
        }
      }
    }
    
    // Calculate estimated delivery (3-5 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
    
    const orderData = { 
      user: req.user.userId,
      customerName, 
      customerEmail, 
      phone,
      address,
      items: itemsWithImages,
      subtotal,
      discount: discountAmount,
      total: total || (subtotal - discountAmount),
      notes,
      estimatedDelivery,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentStatus || 'pending'
    };
    
    // Cộng số lượng đã bán cho sản phẩm
    for (const item of itemsWithImages) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { sold: item.quantity }
      });
    }
    
    if (couponData) {
      orderData.coupon = couponData;
    }
    
    const o = new Order(orderData);
    await o.save();
    res.json(o);
  }catch(err){ 
    res.status(500).json({ message: err.message }) 
  }
});

// admin/collaborator list - Cho phép cả admin và cộng tác viên xem danh sách đơn hàng
router.get('/', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  const list = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email avatar')
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

// admin/collaborator update status with history tracking
router.put('/:id/status', requireAuth, requireAdminOrCollaborator, async (req, res) => {
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
    
    // Set delivered date if completed and update sold count
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      
      // Tăng số lượng đã bán cho mỗi sản phẩm trong đơn hàng
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { sold: item.quantity }
        });
      }
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

// Customer cancel order (pending or confirmed only)
router.put('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Check if user owns this order or is admin
    if (order.user && order.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền hủy đơn hàng này' });
    }
    
    // Only allow cancellation for non-delivered and non-cancelled orders
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Không thể hủy đơn hàng đã giao hoặc đã hủy' 
      });
    }
    
    // Update status to cancelled
    order.status = 'cancelled';
    order.cancelReason = reason || 'Khách hàng hủy đơn';
    
    // Add to history
    order.statusHistory.push({
      status: 'cancelled',
      note: `Khách hàng hủy đơn. Lý do: ${reason || 'Không có lý do'}`,
      updatedBy: req.user.userId,
      updatedAt: new Date()
    });
    
    // Restore stock for cancelled orders
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }
    
    await order.save();
    
    // Populate and return
    if (order.items && order.items.length > 0) {
      await order.populate('items.product');
    }
    if (order.statusHistory && order.statusHistory.length > 0) {
      await order.populate('statusHistory.updatedBy', 'name');
    }
    
    res.json(order);
  } catch (err) {
    console.error('Cancel order error:', err);
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

// Admin update payment status
router.put('/:id/payment', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ' });
    }
    
    order.paymentStatus = paymentStatus;
    await order.save();
    
    await order.populate('items.product');
    await order.populate('user', 'name email avatar');
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Alias route for payment-status
router.put('/:id/payment-status', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ' });
    }
    
    order.paymentStatus = paymentStatus;
    await order.save();
    
    await order.populate('items.product');
    await order.populate('user', 'name email avatar');
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ZaloPay webhook: auto confirm payment and notify system
router.post('/payment/zalopay/webhook', async (req, res) => {
  try {
    const { orderId, status, amount, description } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Thiếu orderId' });
    }

    if (status !== 'success') {
      return res.status(400).json({ message: 'Thanh toán chưa thành công' });
    }

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.paymentMethod = 'qr';
      order.statusHistory.push({
        status: order.status,
        note: '✅ ZaloPay xác nhận đã thanh toán thành công',
        updatedAt: new Date()
      });
      await order.save();

      // Send notification to system
      await Message.create({
        name: 'Hệ thống ZaloPay',
        email: 'zalopay@thesungarden.vn',
        phone: '',
        subject: '💳 Xác nhận thanh toán tự động',
        message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} đã được thanh toán qua ZaloPay\\n` +
                 `Số tiền: ${amount ? Number(amount).toLocaleString('vi-VN') + '₫' : 'N/A'}\\n` +
                 `Khách hàng: ${order.customerName}\\n` +
                 `Trạng thái: Đã xác nhận tự động`
      });
    }

    res.json({ message: 'Đã cập nhật thanh toán ZaloPay', order });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Simulate ZaloPay payment (for testing - remove in production)
router.post('/payment/zalopay/simulate/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Simulate webhook call
    const webhookData = {
      orderId: orderId,
      status: 'success',
      amount: order.total,
      description: 'Thanh toán mô phỏng - TEST'
    };

    // Call webhook internally
    const webhookResponse = await fetch(`http://localhost:5000/api/orders/payment/zalopay/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData)
    });

    const result = await webhookResponse.json();
    res.json({ message: '✅ Mô phỏng thanh toán thành công', result });
  } catch (err) {
    console.error('Simulate error:', err);
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
