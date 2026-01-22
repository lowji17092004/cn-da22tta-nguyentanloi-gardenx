const Category = require('../models/Category');
const Product = require('../models/Product');
const Article = require('../models/Article');

// Lấy thống kê danh mục
const getCategoryStats = async (req, res) => {
  try {
    const { includeHidden } = req.query;
    const categoryFilter = includeHidden === 'true' ? {} : { isVisible: { $ne: false } };
    const categories = await Category.find(categoryFilter);
    const products = await Product.find({ isHidden: { $ne: true } });
    const articles = await Article.find();
    
    const productCategories = categories.filter(c => c.type === 'product' || !c.type);
    const blogCategories = categories.filter(c => c.type === 'blog');
    
    // Calculate product category stats
    const productCategoryStats = productCategories.map(cat => {
      const categoryProducts = products.filter(p => {
        const pSlug = (p.category || '').toLowerCase().trim();
        return pSlug === cat.slug || pSlug === cat.name.toLowerCase();
      });
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        type: 'product',
        subcategories: cat.subcategories || [],
        productCount: categoryProducts.length,
        totalStock: categoryProducts.reduce((sum, p) => sum + (p.stock || 0), 0),
        totalValue: categoryProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
      };
    });
    
    // Calculate blog category stats  
    const blogCategoryStats = blogCategories.map(cat => {
      const categoryArticles = articles.filter(a => 
        a.category === cat.slug || a.category === cat.name
      );
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        type: 'blog',
        subcategories: cat.subcategories || [],
        articleCount: categoryArticles.length
      };
    });
    
    // Summary stats
    const summary = {
      totalProductCategories: productCategories.length,
      totalBlogCategories: blogCategories.length,
      totalSubcategories: categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0),
      totalProducts: products.length,
      totalArticles: articles.length,
      totalStock: products.reduce((sum, p) => sum + (p.stock || 0), 0)
    };
    
    res.json({
      summary,
      productCategories: productCategoryStats,
      blogCategories: blogCategoryStats
    });
  } catch (err) {
    console.error('Error fetching category stats:', err);
    res.status(500).json({ message: 'Không thể lấy thống kê danh mục' });
  }
};

// Lấy tất cả danh mục
const getAllCategories = async (req, res) => {
  try {
    const { type, includeHidden } = req.query;
    let filter = type ? { type } : {};
    
    if (includeHidden !== 'true') {
      filter.isVisible = { $ne: false };
    }
    
    const cats = await Category.find(filter).sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: 'Không thể lấy danh mục' });
  }
};

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Tạo danh mục mới
const createCategory = async (req, res) => {
  try {
    const { name, slug, color, type, subcategories, description, image } = req.body;
    const exists = await Category.findOne({ slug, type: type || 'product' });
    if (exists) return res.status(400).json({ message: 'Slug danh mục đã tồn tại' });
    
    const cat = new Category({ 
      name, 
      slug, 
      color, 
      type: type || 'product', 
      subcategories: subcategories || [],
      description: description || '',
      image: image || ''
    });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Tạo danh mục thất bại' });
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { name, slug, color, type, subcategories, description, image } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    
    cat.name = name || cat.name;
    cat.slug = slug || cat.slug;
    cat.color = color || cat.color;
    if (type) cat.type = type;
    if (subcategories !== undefined) cat.subcategories = subcategories;
    if (description !== undefined) cat.description = description;
    if (image !== undefined) cat.image = image;
    
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Cập nhật thất bại' });
  }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json({ message: 'Đã xóa danh mục' });
  } catch (err) {
    res.status(500).json({ message: 'Xóa thất bại' });
  }
};

// Thêm subcategory
const addSubcategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    
    const exists = cat.subcategories.find(sub => sub.slug === slug);
    if (exists) return res.status(400).json({ message: 'Slug danh mục con đã tồn tại' });
    
    cat.subcategories.push({ name, slug });
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Thêm danh mục con thất bại' });
  }
};

// Cập nhật subcategory
const updateSubcategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    
    const subIndex = cat.subcategories.findIndex(sub => sub._id.toString() === req.params.subId);
    if (subIndex === -1) return res.status(404).json({ message: 'Không tìm thấy danh mục con' });
    
    cat.subcategories[subIndex].name = name || cat.subcategories[subIndex].name;
    cat.subcategories[subIndex].slug = slug || cat.subcategories[subIndex].slug;
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Cập nhật danh mục con thất bại' });
  }
};

// Xóa subcategory
const deleteSubcategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    
    cat.subcategories = cat.subcategories.filter(sub => sub._id.toString() !== req.params.subId);
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: 'Xóa danh mục con thất bại' });
  }
};

module.exports = {
  getCategoryStats,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory
};
