const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { 
    type: String, 
    required: true,
    default: 'info'
  },
  summary: String,
  content: String,
  featuredImage: String,
  images: [String],
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// Auto generate slug if not provided
articleSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);
