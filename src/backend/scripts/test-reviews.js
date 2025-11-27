const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

mongoose.connect('mongodb://127.0.0.1:27017/flower-shop')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get a product with existing reviews
    const productWithReview = await Product.findOne({ 
      _id: { $in: ['6925c456c7381d2d8fffd152', '6926bf7bea9923c77f61e8f8'] }
    });
    
    if (!productWithReview) {
      console.log('Product not found');
      process.exit(1);
    }
    
    console.log('Testing product:', productWithReview._id, '-', productWithReview.name);
    
    // Check existing reviews
    const reviews = await Review.find({ 
      product: productWithReview._id,
      isApproved: true,
      isHidden: false
    }).populate('user', 'name');
    
    console.log(`Found ${reviews.length} approved reviews:`);
    reviews.forEach(r => {
      console.log('- Rating:', r.rating, '| User:', r.user?.name, '| Comment:', r.comment?.substring(0, 30));
    });
    
    // Calculate stats
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;
      console.log('\nStats:');
      console.log('- Average rating:', avgRating.toFixed(2));
      console.log('- Total reviews:', reviews.length);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
