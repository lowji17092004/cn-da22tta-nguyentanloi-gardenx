const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public routes
router.get('/stats', categoryController.getCategoryStats);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// Subcategory routes
router.post('/:id/subcategories', categoryController.addSubcategory);
router.put('/:id/subcategories/:subId', categoryController.updateSubcategory);
router.delete('/:id/subcategories/:subId', categoryController.deleteSubcategory);

module.exports = router;
