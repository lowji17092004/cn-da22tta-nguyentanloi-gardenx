const Article = require('../models/Article');
const fs = require('fs');
const path = require('path');

// Lấy danh sách bài viết
const getArticles = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const list = await Article.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy bài viết theo slug
const getArticleBySlug = async (req, res) => {
  try {
    const a = await Article.findOne({ slug: req.params.slug });
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo bài viết mới (Admin)
const createArticle = async (req, res) => {
  try {
    const a = new Article(req.body);
    await a.save();
    res.json(a);
  } catch (err) {
    console.error('Create article error:', err);
    res.status(400).json({ message: err.message || 'Không thể tạo bài viết' });
  }
};

// Cập nhật bài viết (Admin)
const updateArticle = async (req, res) => {
  try {
    const a = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(a);
  } catch (err) {
    console.error('Update article error:', err);
    res.status(400).json({ message: err.message || 'Không thể cập nhật bài viết' });
  }
};

// Xóa bài viết (Admin)
const deleteArticle = async (req, res) => {
  try {
    const a = await Article.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    
    // Xóa ảnh từ uploads
    try {
      if (a.images && a.images.length) {
        for (const img of a.images) {
          if (!img) continue;
          const fname = img.split('/').pop();
          const fp = path.join(__dirname, '..', 'uploads', fname);
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
      }
    } catch (err) {
      console.error('Remove images error:', err);
    }
    
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle
};
