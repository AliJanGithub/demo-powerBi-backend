// middlewares/upload.middleware.js
import multer from 'multer';

const storage = multer.memoryStorage(); // stores image in memory as buffer

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // limit 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  }
});
