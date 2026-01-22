// Payment service for handling payment logic
const Order = require('../models/Order');
const Message = require('../models/Message');

// Process ZaloPay payment
const processZaloPayPayment = async (orderId, status, amount) => {
  const order = await Order.findById(orderId).populate('user', 'name email');
  
  if (!order) {
    throw new Error('Không tìm thấy đơn hàng');
  }

  if (status !== 'success') {
    throw new Error('Thanh toán chưa thành công');
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

    // Create system notification
    await Message.create({
      name: 'Hệ thống ZaloPay',
      email: 'zalopay@thesungarden.vn',
      phone: '',
      subject: '💳 Xác nhận thanh toán tự động',
      message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} đã được thanh toán qua ZaloPay\n` +
               `Số tiền: ${amount ? Number(amount).toLocaleString('vi-VN') + '₫' : 'N/A'}\n` +
               `Khách hàng: ${order.customerName}\n` +
               `Trạng thái: Đã xác nhận tự động`
    });
  }

  return order;
};

// Validate payment status
const validatePaymentStatus = (status) => {
  const validStatuses = ['pending', 'paid', 'failed'];
  return validStatuses.includes(status);
};

// Calculate order total with discount
const calculateOrderTotal = (subtotal, discountAmount = 0) => {
  return subtotal - discountAmount;
};

module.exports = {
  processZaloPayPayment,
  validatePaymentStatus,
  calculateOrderTotal
};
