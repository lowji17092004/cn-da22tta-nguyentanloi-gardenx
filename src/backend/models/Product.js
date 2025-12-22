const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [String],
  category: String,
  subcategory: String, // Danh mục con
  stock: { type: Number, default: 0 },
  sold: { type: Number, default: 0 }, // Số lượng đã bán
  isFeatured: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false } // Ẩn sản phẩm
}, { timestamps: true });

// Virtual field: sản phẩm bán chạy nếu sold >= 10
productSchema.virtual('isBestSeller').get(function() {
  return this.sold >= 10;
});

// Đảm bảo virtual fields được include khi convert to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
