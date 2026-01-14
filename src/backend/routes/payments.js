const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const { requireAuth } = require('../middleware/auth');

// ==================== ZaloPay Configuration ====================
const ZALOPAY_CONFIG = {
  app_id: process.env.ZALO_APP_ID || '2554',
  key1: process.env.ZALO_KEY1 || 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: process.env.ZALO_KEY2 || 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: process.env.ZALO_API_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create',
  callback_url: process.env.ZALO_CALLBACK_URL || 'http://localhost:5000/api/payments/zalopay/callback'
};

// ==================== VietQR Configuration ====================
// Danh sách các ngân hàng phổ biến
const BANKS = {
  'VCB': { name: 'Vietcombank', bin: '970436' },
  'TCB': { name: 'Techcombank', bin: '970407' },
  'MB': { name: 'MB Bank', bin: '970422' },
  'VTB': { name: 'Vietinbank', bin: '970415' },
  'ACB': { name: 'ACB', bin: '970416' },
  'BIDV': { name: 'BIDV', bin: '970418' },
  'AGR': { name: 'Agribank', bin: '970405' },
  'SCB': { name: 'Sacombank', bin: '970403' },
  'VPB': { name: 'VPBank', bin: '970432' }
};

// Thông tin tài khoản nhận tiền (thay đổi theo thông tin thực tế)
const BANK_ACCOUNT = {
  accountNo: process.env.BANK_ACCOUNT_NO || '1234567890',
  accountName: process.env.BANK_ACCOUNT_NAME || 'FLOREA',
  bankCode: process.env.BANK_CODE || 'VCB'
};

// ==================== Helper Functions ====================

/**
 * Tạo MAC signature cho ZaloPay
 */
function createZaloPayMAC(params) {
  const data = `${params.app_id}|${params.app_trans_id}|${params.app_user}|${params.amount}|${params.app_time}|${params.embed_data}|${params.item}`;
  return crypto.createHmac('sha256', ZALOPAY_CONFIG.key1).update(data).digest('hex');
}

/**
 * Tạo app_trans_id unique cho mỗi transaction
 */
function generateAppTransId() {
  const date = moment().format('YYMMDD');
  const timestamp = Date.now();
  return `${date}_${timestamp}`;
}

/**
 * Tạo VietQR link theo chuẩn VietQR
 */
function generateVietQRLink(amount, orderCode, description) {
  const { accountNo, accountName, bankCode } = BANK_ACCOUNT;
  const bank = BANKS[bankCode];
  
  if (!bank) {
    throw new Error('Ngân hàng không được hỗ trợ');
  }

  // VietQR API format
  const baseUrl = 'https://img.vietqr.io/image';
  const params = new URLSearchParams({
    accountNo: accountNo,
    accountName: accountName,
    amount: amount,
    addInfo: description || `Thanh toan don hang ${orderCode}`,
  });

  return `${baseUrl}/${bank.bin}-${accountNo}-compact2.jpg?${params.toString()}`;
}

// ==================== ZaloPay Routes ====================

/**
 * POST /api/payments/zalopay/create
 * Tạo đơn hàng thanh toán ZaloPay và trả về QR code
 */
router.post('/zalopay/create', requireAuth, async (req, res) => {
  try {
    const { amount, orderId, items, orderData } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    const app_trans_id = generateAppTransId();
    const embed_data = JSON.stringify({
      redirecturl: process.env.FRONTEND_URL || 'http://localhost:5173',
      orderId: orderId,
      userId: req.user.id,
      orderData: orderData || null // Thêm orderData vào embed_data
    });

    const order = {
      app_id: ZALOPAY_CONFIG.app_id,
      app_trans_id: app_trans_id,
      app_user: req.user.email || req.user.id.toString(),
      app_time: Date.now(),
      amount: Math.round(amount),
      item: JSON.stringify(items || []),
      embed_data: embed_data,
      description: `Thanh toán đơn hàng #${orderId}`,
      bank_code: 'zalopayapp',
      callback_url: ZALOPAY_CONFIG.callback_url
    };

    // Tạo MAC signature
    order.mac = createZaloPayMAC(order);

    // Gọi ZaloPay API
    const response = await axios.post(ZALOPAY_CONFIG.endpoint, null, { params: order });

    if (response.data.return_code === 1) {
      res.json({
        success: true,
        return_code: response.data.return_code,
        order_url: response.data.order_url,
        zp_trans_token: response.data.zp_trans_token,
        app_trans_id: app_trans_id,
        qr_code: response.data.qr_code || null
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Tạo đơn hàng ZaloPay thất bại',
        return_code: response.data.return_code,
        return_message: response.data.return_message
      });
    }
  } catch (error) {
    console.error('ZaloPay create error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Lỗi khi tạo đơn hàng ZaloPay',
      error: error.response?.data || error.message 
    });
  }
});

/**
 * POST /api/payments/zalopay/callback
 * Xử lý callback từ ZaloPay khi thanh toán thành công
 */
router.post('/zalopay/callback', async (req, res) => {
  try {
    const { data: dataStr, mac: reqMac } = req.body;

    // Verify MAC
    const mac = crypto.createHmac('sha256', ZALOPAY_CONFIG.key2)
      .update(dataStr)
      .digest('hex');

    if (reqMac !== mac) {
      return res.json({ return_code: -1, return_message: 'MAC không hợp lệ' });
    }

    const data = JSON.parse(dataStr);
    console.log('ZaloPay callback data:', data);

    // Parse embed_data để lấy orderId và userId
    const embedData = JSON.parse(data.embed_data);
    const { orderId, userId, orderData } = embedData;

    // Import models
    const Order = require('../models/Order');
    const Product = require('../models/Product');

    // Nếu có orderData (đặt hàng mới), tạo order mới
    if (orderData) {
      console.log('Creating new order from ZaloPay callback');
      // Parse orderData
      const parsedOrderData = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
      const { customerName, customerEmail, phone, address, items, total, notes, coupon } = parsedOrderData;
      
      // Chuẩn bị items với thông tin sản phẩm
      const itemsWithImages = [];
      let subtotal = 0;
      
      for (const item of items) {
        const product = await Product.findById(item.product);
        
        if (!product) {
          console.error(`Product ${item.product} not found`);
          continue;
        }
        
        if (product.stock < item.quantity) {
          console.error(`Product ${product.name} insufficient stock`);
          continue;
        }
        
        // Trừ stock và cộng sold
        product.stock -= item.quantity;
        product.sold = (product.sold || 0) + item.quantity;
        await product.save();
        
        const itemPrice = item.price || product.price;
        subtotal += itemPrice * item.quantity;
        
        itemsWithImages.push({
          product: item.product,
          name: product.name,
          price: itemPrice,
          quantity: item.quantity,
          image: product.images?.[0] || item.image || '',
          reviewed: false
        });
      }
      
      // Tạo order mới
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);
      
      const newOrder = new Order({
        user: userId,
        customerName,
        customerEmail,
        phone,
        address,
        items: itemsWithImages,
        subtotal,
        discount: coupon?.discountAmount || 0,
        total: total || subtotal,
        notes,
        estimatedDelivery,
        paymentMethod: 'zalopay',
        paymentStatus: 'paid',
        paidAt: new Date(),
        zaloPayTransId: data.app_trans_id,
        coupon: coupon || null
      });
      
      await newOrder.save();
      console.log(`Order created successfully: ${newOrder._id}`);
      
      // Cập nhật coupon usage nếu có
      if (coupon && coupon.userCouponId) {
        const UserCoupon = require('../models/UserCoupon');
        await UserCoupon.findByIdAndUpdate(coupon.userCouponId, {
          used: true,
          usedAt: new Date()
        });
        console.log(`Coupon ${coupon.code} marked as used`);
      }
      
    } else if (orderId) {
      console.log(`Updating existing order: ${orderId}`);
      // Nếu chỉ có orderId, cập nhật order đã tồn tại
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        paidAt: new Date(),
        zaloPayTransId: data.app_trans_id
      });
      console.log(`Order ${orderId} payment status updated to paid`);
    }

    res.json({ return_code: 1, return_message: 'Thanh toán thành công' });
  } catch (error) {
    console.error('ZaloPay callback error:', error);
    res.json({ return_code: 0, return_message: error.message });
  }
});

// ==================== VietQR Routes ====================

/**
 * POST /api/payments/vietqr/create
 * Tạo mã QR cho chuyển khoản ngân hàng
 */
router.post('/vietqr/create', requireAuth, async (req, res) => {
  try {
    const { amount, orderId, orderCode } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Số tiền không hợp lệ' });
    }

    const description = `TSG ${orderCode || orderId}`;
    const qrUrl = generateVietQRLink(amount, orderCode || orderId, description);

    res.json({
      success: true,
      qr_url: qrUrl,
      bank_info: {
        bank_name: BANKS[BANK_ACCOUNT.bankCode].name,
        bank_code: BANK_ACCOUNT.bankCode,
        account_no: BANK_ACCOUNT.accountNo,
        account_name: BANK_ACCOUNT.accountName
      },
      amount: amount,
      description: description,
      note: 'Vui lòng chuyển khoản đúng nội dung để đơn hàng được xử lý nhanh nhất'
    });
  } catch (error) {
    console.error('VietQR create error:', error);
    res.status(500).json({ 
      message: 'Lỗi khi tạo mã QR',
      error: error.message 
    });
  }
});

/**
 * GET /api/payments/banks
 * Lấy danh sách ngân hàng hỗ trợ
 */
router.get('/banks', (req, res) => {
  const bankList = Object.entries(BANKS).map(([code, info]) => ({
    code,
    name: info.name,
    bin: info.bin
  }));

  res.json({
    success: true,
    banks: bankList,
    current_bank: {
      code: BANK_ACCOUNT.bankCode,
      name: BANKS[BANK_ACCOUNT.bankCode].name,
      account_no: BANK_ACCOUNT.accountNo,
      account_name: BANK_ACCOUNT.accountName
    }
  });
});

/**
 * POST /api/payments/zalopay/query
 * Kiểm tra trạng thái thanh toán ZaloPay
 */
router.post('/zalopay/query', requireAuth, async (req, res) => {
  try {
    const { app_trans_id } = req.body;

    if (!app_trans_id) {
      return res.status(400).json({ message: 'Thiếu app_trans_id' });
    }

    const params = {
      app_id: ZALOPAY_CONFIG.app_id,
      app_trans_id: app_trans_id
    };

    // Tạo MAC để query
    const data = `${params.app_id}|${params.app_trans_id}|${ZALOPAY_CONFIG.key1}`;
    params.mac = crypto.createHmac('sha256', ZALOPAY_CONFIG.key1).update(data).digest('hex');

    // Query ZaloPay
    const response = await axios.post(
      'https://sb-openapi.zalopay.vn/v2/query',
      null,
      { params }
    );

    console.log('[ZaloPay Query] Result:', response.data);

    res.json({
      success: true,
      return_code: response.data.return_code,
      return_message: response.data.return_message,
      is_processing: response.data.is_processing,
      amount: response.data.amount,
      zp_trans_id: response.data.zp_trans_id
    });
  } catch (error) {
    console.error('ZaloPay query error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Lỗi khi kiểm tra trạng thái thanh toán',
      error: error.response?.data || error.message 
    });
  }
});

/**
 * POST /api/payments/zalopay/create-order
 * Tạo order sau khi xác nhận thanh toán ZaloPay thành công
 */
router.post('/zalopay/create-order', requireAuth, async (req, res) => {
  try {
    const { app_trans_id, orderData } = req.body;

    if (!app_trans_id || !orderData) {
      return res.status(400).json({ message: 'Thiếu thông tin đơn hàng' });
    }

    // Verify payment status với ZaloPay
    const params = {
      app_id: ZALOPAY_CONFIG.app_id,
      app_trans_id: app_trans_id
    };
    const data = `${params.app_id}|${params.app_trans_id}|${ZALOPAY_CONFIG.key1}`;
    params.mac = crypto.createHmac('sha256', ZALOPAY_CONFIG.key1).update(data).digest('hex');

    const queryResponse = await axios.post(
      'https://sb-openapi.zalopay.vn/v2/query',
      null,
      { params }
    );

    console.log('[ZaloPay Create Order] Query result:', queryResponse.data);

    // return_code = 1 nghĩa là thanh toán thành công
    if (queryResponse.data.return_code !== 1) {
      return res.status(400).json({ 
        message: 'Thanh toán chưa hoàn tất',
        return_code: queryResponse.data.return_code,
        return_message: queryResponse.data.return_message
      });
    }

    // Import models
    const Order = require('../models/Order');
    const Product = require('../models/Product');

    // Parse orderData
    const parsedOrderData = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
    const { customerName, customerEmail, phone, address, items, total, notes, coupon } = parsedOrderData;

    // Check if order already exists with this trans_id
    const existingOrder = await Order.findOne({ zaloPayTransId: app_trans_id });
    if (existingOrder) {
      console.log('[ZaloPay] Order already exists:', existingOrder._id);
      return res.json({
        success: true,
        message: 'Đơn hàng đã được tạo trước đó',
        order: existingOrder
      });
    }

    // Chuẩn bị items với thông tin sản phẩm
    const itemsWithImages = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        console.error(`Product ${item.product} not found`);
        continue;
      }

      if (product.stock < item.quantity) {
        console.error(`Product ${product.name} insufficient stock`);
        continue;
      }

      // Trừ stock và cộng sold
      product.stock -= item.quantity;
      product.sold = (product.sold || 0) + item.quantity;
      await product.save();

      const itemPrice = item.price || product.price;
      subtotal += itemPrice * item.quantity;

      itemsWithImages.push({
        product: item.product,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.images?.[0] || item.image || '',
        reviewed: false
      });
    }

    // Tạo order mới
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    const newOrder = new Order({
      user: req.user.id,
      customerName,
      customerEmail,
      phone,
      address,
      items: itemsWithImages,
      subtotal,
      discount: coupon?.discountAmount || 0,
      total: total || subtotal,
      notes,
      estimatedDelivery,
      paymentMethod: 'zalopay',
      paymentStatus: 'paid',
      paidAt: new Date(),
      zaloPayTransId: app_trans_id,
      coupon: coupon || null
    });

    await newOrder.save();
    console.log(`[ZaloPay] Order created successfully: ${newOrder._id}`);

    // Cập nhật coupon usage nếu có
    if (coupon && coupon.userCouponId) {
      const UserCoupon = require('../models/UserCoupon');
      await UserCoupon.findByIdAndUpdate(coupon.userCouponId, {
        used: true,
        usedAt: new Date()
      });
      console.log(`[ZaloPay] Coupon ${coupon.code} marked as used`);
    }

    res.json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      order: newOrder
    });
  } catch (error) {
    console.error('[ZaloPay] Create order error:', error);
    res.status(500).json({
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message
    });
  }
});

module.exports = router;
