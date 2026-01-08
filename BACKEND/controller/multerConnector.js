const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
let uploadPath = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
console.log("Upload path for pictures:", uploadPath);

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG images are allowed.'));
  }
};

// Multer upload middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = { upload };
