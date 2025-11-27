const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  reply: {
    text: String,
    date: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
        isHidden: false
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0
  };
};

// Method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function(productId) {
  const distribution = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isApproved: true,
        isHidden: false
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);

  // Initialize all ratings to 0
  const result = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  // Fill in actual counts
  distribution.forEach(item => {
    result[item._id] = item.count;
  });

  return result;
};

module.exports = mongoose.model('Review', reviewSchema);
