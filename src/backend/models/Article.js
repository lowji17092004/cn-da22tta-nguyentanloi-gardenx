const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['about', 'info', 'care', 'inspiration'], 
    required: true,
    default: 'info'
  },
  summary: String,
  content: String,
  featuredImage: String,
  images: [String],
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
