// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomnumber-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'wisata-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept all common image formats
const fileFilter = (req, file, cb) => {
  // Comprehensive list of image extensions including phone camera formats
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|svg|tiff|tif|heic|heif|jfif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Common MIME types for images including mobile phone formats
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/x-ms-bmp',
    'image/svg+xml',
    'image/tiff',
    'image/heic',
    'image/heif',
    'image/jfif'
  ];
  
  const mimetypeValid = allowedMimeTypes.includes(file.mimetype.toLowerCase());

  if (mimetypeValid || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif, webp, bmp, heic, dll)'));
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size (increased for high-res phone photos)
  fileFilter: fileFilter
});

module.exports = upload;
