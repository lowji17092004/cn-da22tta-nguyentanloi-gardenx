const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Lấy danh sách sản phẩm (public)
const getProducts = async (req, res) => {
  try {
    const { category, bestseller, featured, includeHidden } = req.query;
    let query = { isHidden: { $ne: true } };
    
    if (includeHidden === 'true') {
      query = {};
    }
    
    if (category) {
      let categoryFilter = null;
      
      if (mongoose.Types.ObjectId.isValid(category)) {
        const cat = await Category.findById(category);
        if (cat) {
          categoryFilter = {
            $or: [
              { category: new RegExp(`^${cat.slug}$`, 'i') },
              { category: new RegExp(`^${cat.name}$`, 'i') }
            ]
          };
        }
      } else {
        categoryFilter = {
          $or: [
            { category: new RegExp(`^${category}$`, 'i') },
            { category: category }
          ]
        };
      }
      
      if (categoryFilter) {
        query = { ...query, ...categoryFilter };
      }
    }
    
    if (bestseller === 'true') {
      const paidSalesAggregation = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', paidQuantity: { $sum: '$items.quantity' } } },
        { $match: { paidQuantity: { $gte: 10 } } }
      ]);
      
      const bestsellersIds = paidSalesAggregation.map(item => item._id);
      query._id = { $in: bestsellersIds };
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    const items = await Product.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo sản phẩm mới (Admin)
const createProduct = async (req, res) => {
  try {
    const data = req.body;
    const p = new Product(data);
    await p.save();
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm (Admin)
const updateProduct = async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm (Admin)
const deleteProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    
    // Xóa ảnh từ uploads
    try {
      if (p.images && p.images.length) {
        for (const img of p.images) {
          if (!img) continue;
          const fname = img.split('/').pop();
          const fp = path.join(__dirname, '..', 'uploads', fname);
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
      }
    } catch (err) {
      console.error('Remove images error:', err);
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ẩn/hiện sản phẩm (Admin)
const toggleVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.isHidden = !product.isHidden;
    await product.save();
    
    res.json({ 
      message: product.isHidden ? 'Đã ẩn sản phẩm' : 'Đã hiển thị sản phẩm',
      isHidden: product.isHidden 
    });
  } catch (err) {
    console.error('Toggle visibility error', err);
    res.status(500).json({ message: 'Failed to toggle visibility' });
  }
};

// Xóa tất cả sản phẩm (Admin)
const deleteAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    
    // Xóa tất cả ảnh
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
      } catch (err) {
        console.error('Remove images error for product', p._id, err);
      }
    }
    
    const result = await Product.deleteMany({});
    res.json({ message: 'All products deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Delete all products error', err);
    res.status(500).json({ message: 'Failed to delete products' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleVisibility,
  deleteAllProducts
};
