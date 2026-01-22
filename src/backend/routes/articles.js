const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const articleController = require('../controllers/articleController');

// Public routes
router.get('/', articleController.getArticles);
router.get('/slug/:slug', articleController.getArticleBySlug);

// Admin routes
router.post('/', requireAuth, requireAdmin, articleController.createArticle);
router.put('/:id', requireAuth, requireAdmin, articleController.updateArticle);
router.delete('/:id', requireAuth, requireAdmin, articleController.deleteArticle);

module.exports = router;
