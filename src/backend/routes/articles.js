const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// list
router.get('/', async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const list = await Article.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

// get by slug
router.get('/slug/:slug', async (req, res) => {
  const a = await Article.findOne({ slug: req.params.slug });
  if (!a) return res.status(404).json({ message: 'Not found' });
  res.json(a);
});

// admin create
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const a = new Article(req.body);
  await a.save();
  res.json(a);
});

// admin update
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const a = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(a);
});

// delete
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const a = await Article.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  const fs = require('fs');
  const path = require('path');
  try{
    if (a.images && a.images.length){
      for (const img of a.images){
        if (!img) continue
        const fname = img.split('/').pop()
        const fp = path.join(__dirname, '..', 'uploads', fname)
        if (fs.existsSync(fp)) fs.unlinkSync(fp)
      }
    }
  }catch(err){ console.error('remove images error', err) }
  await Article.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
