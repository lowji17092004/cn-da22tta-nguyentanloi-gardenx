const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: String,
  content: String,
  images: [String]
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
