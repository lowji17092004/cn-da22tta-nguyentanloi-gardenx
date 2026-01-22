// File service for handling file uploads and deletions
const fs = require('fs');
const path = require('path');

// Delete file from uploads
const deleteFile = (filePath) => {
  try {
    if (!filePath) return false;
    
    const fname = filePath.split('/').pop();
    const fp = path.join(__dirname, '..', 'uploads', fname);
    
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Delete file error:', err);
    return false;
  }
};

// Delete multiple files
const deleteFiles = (filePaths) => {
  if (!filePaths || !Array.isArray(filePaths)) return;
  
  for (const filePath of filePaths) {
    deleteFile(filePath);
  }
};

// Ensure upload directory exists
const ensureUploadDir = (subDir = '') => {
  const uploadPath = path.join(__dirname, '..', 'uploads', subDir);
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  return uploadPath;
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().slice(1);
};

// Check if file is an image
const isImage = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
  return imageExtensions.includes(getFileExtension(filename));
};

// Check if file is a video
const isVideo = (filename) => {
  const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  return videoExtensions.includes(getFileExtension(filename));
};

module.exports = {
  deleteFile,
  deleteFiles,
  ensureUploadDir,
  getFileExtension,
  isImage,
  isVideo
};
