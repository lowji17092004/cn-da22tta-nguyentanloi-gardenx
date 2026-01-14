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

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    console.log('File filter - mimetype:', file.mimetype, 'originalname:', file.originalname);
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp, avif)'));
  }
})

// Upload a single file (accepts both 'file' and 'image' field names)
router.post('/', (req, res) => {
  console.log('Upload request received');
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    if (!req.files || req.files.length === 0) {
      console.error('No file uploaded - req.files:', req.files);
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const file = req.files[0];
    const urlPath = `/uploads/${file.filename}`;
    console.log('File uploaded successfully:', urlPath);
    res.json({ url: urlPath, path: urlPath, filename: file.filename });
  });
});

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
