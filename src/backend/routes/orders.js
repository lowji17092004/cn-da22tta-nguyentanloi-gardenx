const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// create order
router.post('/', requireAuth, async (req, res) => {
  try{
    const { customerName, customerEmail, phone, address, items, total, notes } = req.body;
    
    // Kiểm tra và cập nhật số lượng tồn kho
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm ${item.name} không tồn tại` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm trong kho` 
        });
      }
      
      // Giảm số lượng tồn kho
      product.stock -= item.quantity;
      await product.save();
    }
    
    const o = new Order({ 
      user: req.user.userId,
      customerName, 
      customerEmail, 
      phone,
      address,
      items, 
      total, 
      notes 
    });
    await o.save();
    res.json(o);
  }catch(err){ 
    res.status(500).json({ message: err.message }) 
  }
});

// admin list
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const list = await Order.find().sort({ createdAt: -1 }).populate('items.product');
  res.json(list);
});

// get user's orders
router.get('/my-orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// admin update status
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const o = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(o);
});

module.exports = router;
