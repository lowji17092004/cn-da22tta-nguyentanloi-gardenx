const mongoose = require('mongoose')

// Schema cho danh mục con
const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true }
}, { _id: true })

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  color: { type: String, default: '#10b981' },
  type: { type: String, enum: ['product', 'blog'], default: 'product' },
  subcategories: [subcategorySchema]
}, { timestamps: true })

module.exports = mongoose.model('Category', categorySchema)
