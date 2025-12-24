const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireAdmin, requireAdminOrCollaborator } = require('../middleware/auth');

// Configure multer for review media upload
const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/reviews');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const reviewUpload = multer({
  storage: reviewStorage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|mov|avi|webm|mkv/;
    const extname = path.extname(file.originalname).toLowerCase().slice(1);
    const mimetype = file.mimetype;
    
    if (allowedImageTypes.test(extname) || mimetype.startsWith('image/')) {
      cb(null, true);
    } else if (allowedVideoTypes.test(extname) || mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload hình ảnh (jpg, png, gif, webp) hoặc video (mp4, mov, avi, webm)'));
    }
  }
});

// Upload review media (images and videos)
router.post('/upload-media', requireAuth, reviewUpload.array('media', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn file để upload' });
    }
    
    const images = [];
    const videos = [];
    
    req.files.forEach(file => {
      const filePath = '/uploads/reviews/' + file.filename;
      if (file.mimetype.startsWith('image/')) {
        images.push(filePath);
      } else if (file.mimetype.startsWith('video/')) {
        videos.push(filePath);
      }
    });
    
    res.json({ 
      success: true,
      images, 
      videos,
      message: `Đã upload ${images.length} ảnh và ${videos.length} video`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create review (only for delivered orders)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { orderId, orderItem, productId, product, order, rating, title, comment, images, videos, video } = req.body;
    
    // Support both naming conventions
    const actualOrderId = orderId || order;
    const actualProductId = productId || product;
    
    // If no order ID provided, allow review anyway (for testing/demo)
    if (!actualOrderId) {
      const review = new Review({
        user: req.user.userId,
        product: actualProductId,
        rating,
        title,
        comment,
        images: images || [],
        videos: videos || (video ? [video] : []),
        verifiedPurchase: false,
        isApproved: true // Auto-approve
      });
      
      await review.save();
      await review.populate('user', 'name avatar');
      await review.populate('product', 'name image');
      
      return res.status(201).json(review);
    }
    
    // Verify order exists and belongs to user
    const orderDoc = await Order.findById(actualOrderId);
    if (!orderDoc) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    if (orderDoc.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Bạn không có quyền đánh giá đơn hàng này' });
    }
    
    // Temporarily disabled for testing - allow reviews for all order statuses
    // if (orderDoc.status !== 'delivered') {
    //   return res.status(400).json({ message: 'Chỉ có thể đánh giá đơn hàng đã giao thành công' });
    // }
    
    // Check if product is in order
    const orderItemDoc = orderDoc.items.find(item => 
      item.product.toString() === actualProductId || item._id.toString() === orderItem
    );
    if (!orderItemDoc) {
      return res.status(400).json({ message: 'Sản phẩm không có trong đơn hàng này' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user.userId,
      order: actualOrderId,
      orderItem: orderItem || orderItemDoc._id
    });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }
    
    // Create review
    const review = new Review({
      user: req.user.userId,
      product: actualProductId,
      order: actualOrderId,
      orderItem: orderItem || orderItemDoc._id,
      rating,
      title,
      comment,
      images: images || [],
      videos: videos || (video ? [video] : []),
      verifiedPurchase: true,
      isApproved: true // Auto-approve reviews from verified purchases
    });
    
    await review.save();
    
    // Populate user info
    await review.populate('user', 'name avatar');
    await review.populate('product', 'name image');
    
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi' });
    }
    res.status(500).json({ message: err.message });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };
    if (sort === 'helpful') sortOption = { helpful: -1 };
    
    const reviews = await Review.find({ 
      product: req.params.productId
      // Removed isApproved and isHidden filters for dev/testing
    })
      .populate('user', 'name avatar')
      .populate('reply.repliedBy', 'name')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ 
      product: req.params.productId
      // Removed filters for dev/testing
    });
    
    // Get rating stats
    const stats = await Review.calculateAverageRating(req.params.productId);
    
    // Get rating distribution
    const mongoose = require('mongoose');
    const distribution = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(req.params.productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      stats,
      distribution: distribution.reduce((acc, d) => ({ ...acc, [d._id]: d.count }), {})
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's reviews
router.get('/my-reviews', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.userId })
      .populate('product', 'name images')
      .populate('reply.repliedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if user can review a product from an order
router.get('/can-review/:orderId/:productId', requireAuth, async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user.userId) {
      return res.json({ canReview: false, reason: 'Đơn hàng không hợp lệ' });
    }
    
    if (order.status !== 'delivered') {
      return res.json({ canReview: false, reason: 'Đơn hàng chưa được giao' });
    }
    
    const orderItem = order.items.find(item => item.product.toString() === productId);
    if (!orderItem) {
      return res.json({ canReview: false, reason: 'Sản phẩm không có trong đơn hàng' });
    }
    
    if (orderItem.reviewed) {
      return res.json({ canReview: false, reason: 'Đã đánh giá' });
    }
    
    res.json({ canReview: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's review for a specific product in an order
router.get('/user-review/:productId/:orderId', requireAuth, async (req, res) => {
  try {
    const { productId, orderId } = req.params;
    
    const review = await Review.findOne({
      user: req.user.userId,
      product: productId,
      order: orderId
    }).populate('user', 'name avatar');
    
    if (!review) {
      return res.status(404).json({ message: 'Chưa có đánh giá' });
    }
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update review (user can edit their own review)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { rating, title, comment, images, videos } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Không có quyền sửa đánh giá này' });
    }
    
    review.rating = rating || review.rating;
    review.title = title !== undefined ? title : review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    review.videos = videos || review.videos;
    
    await review.save();
    await review.populate('user', 'name');
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete review (user can delete their own review)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    // Allow user or admin to delete
    if (review.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa đánh giá này' });
    }
    
    // Update order item reviewed status
    await Order.updateOne(
      { _id: review.order, 'items.product': review.product },
      { $set: { 'items.$.reviewed': false } }
    );
    
    await review.deleteOne();
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== ADMIN/COLLABORATOR ROUTES ==========

// Get all reviews (admin/collaborator)
router.get('/', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, rating } = req.query;
    
    let filter = {};
    if (status === 'pending') filter.isApproved = false;
    if (status === 'hidden') filter.isHidden = true;
    if (status === 'unreplied') filter.reply = { $exists: false };
    if (rating) filter.rating = parseInt(rating);
    
    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name images')
      .populate('order', 'createdAt')
      .populate('reply.repliedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments(filter);
    
    // Get stats
    const stats = {
      total: await Review.countDocuments(),
      pending: await Review.countDocuments({ isApproved: false }),
      unreplied: await Review.countDocuments({ reply: { $exists: false } }),
      hidden: await Review.countDocuments({ isHidden: true })
    };
    
    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      stats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin/Collaborator reply to review
router.post('/:id/reply', requireAuth, requireAdminOrCollaborator, async (req, res) => {
  try {
    const { content } = req.body;
    
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    review.reply = {
      content,
      repliedBy: req.user.userId,
      repliedAt: new Date()
    };
    
    await review.save();
    await review.populate('user', 'name');
    await review.populate('product', 'name image');
    await review.populate('reply.repliedBy', 'name');
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin toggle review visibility
router.put('/:id/toggle-visibility', requireAuth, requireAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    review.isHidden = !review.isHidden;
    await review.save();
    
    res.json({ message: review.isHidden ? 'Đã ẩn đánh giá' : 'Đã hiện đánh giá', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin approve review
router.put('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'name');
    
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like/Unlike a review
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    // Toggle like - check if user already liked
    const userId = req.user.id;
    const likedBy = review.likedBy || [];
    const hasLiked = likedBy.some(id => id.toString() === userId);
    
    if (hasLiked) {
      // Unlike - remove user from likedBy array
      review.likedBy = likedBy.filter(id => id.toString() !== userId);
      review.likes = Math.max(0, (review.likes || 0) - 1);
    } else {
      // Like - add user to likedBy array
      review.likedBy = [...likedBy, userId];
      review.likes = (review.likes || 0) + 1;
    }
    
    await review.save();
    
    res.json({ likes: review.likes, hasLiked: !hasLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
