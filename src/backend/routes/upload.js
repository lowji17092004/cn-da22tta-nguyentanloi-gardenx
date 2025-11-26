const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext
    cb(null, name)
  }
})

const upload = multer({ storage })

// Upload a single file
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' })
  const urlPath = `/uploads/${req.file.filename}`
  res.json({ path: urlPath, filename: req.file.filename })
})

// Delete a file (admin only)
router.delete('/:filename', requireAuth, requireAdmin, (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(uploadDir, filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' })
  try{
    fs.unlinkSync(filePath)
    res.json({ message: 'Deleted' })
  }catch(err){
    res.status(500).json({ message: 'Delete failed' })
  }
})

module.exports = router;
