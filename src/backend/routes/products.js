const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public list
router.get('/', async (req, res) => {
  try {
    const { category, bestseller, featured } = req.query;
    let query = {};
    
    // Filter by category
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    // Filter bestsellers (sold >= 10 with paid orders only)
    if (bestseller === 'true') {
      // Aggregate paid orders to find products with >= 10 paid sales
      const paidSalesAggregation = await Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid'
          }
        },
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items.product',
            paidQuantity: { $sum: '$items.quantity' }
          }
        },
        {
          $match: {
            paidQuantity: { $gte: 10 }
          }
        }
      ]);
      
      const bestsellersIds = paidSalesAggregation.map(item => item._id);
      query._id = { $in: bestsellersIds };
    }
    
    // Filter featured
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    const items = await Product.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

// Admin create
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const data = req.body;
  const p = new Product(data);
  await p.save();
  res.json(p);
});

// Admin update
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(p);
});

// Admin delete
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  // remove images from uploads
  const fs = require('fs');
  const path = require('path');
  try{
    if (p.images && p.images.length){
      for (const img of p.images){
        if (!img) continue
        // image stored as /uploads/filename or full url
        const fname = img.split('/').pop()
        const fp = path.join(__dirname, '..', 'uploads', fname)
        if (fs.existsSync(fp)) fs.unlinkSync(fp)
      }
    }
  }catch(err){ console.error('remove images error', err) }
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Admin delete all products
router.delete('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    const fs = require('fs');
    const path = require('path');
    
    // Remove all images
    for (const p of products) {
      try {
        if (p.images && p.images.length) {
          for (const img of p.images) {
            if (!img) continue;
            const fname = img.split('/').pop();
            const fp = path.join(__dirname, '..', 'uploads', fname);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
          }
        }
      } catch(err) { 
        console.error('remove images error for product', p._id, err);
      }
    }
    
    // Delete all products
    const result = await Product.deleteMany({});
    res.json({ message: 'All products deleted', deletedCount: result.deletedCount });
  } catch(err) {
    console.error('Delete all products error', err);
    res.status(500).json({ message: 'Failed to delete products' });
  }
});

module.exports = router;
