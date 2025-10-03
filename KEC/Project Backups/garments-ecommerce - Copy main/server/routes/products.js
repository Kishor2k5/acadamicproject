const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes
router.get('/', productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/:id', productController.getById);

// Protected routes
router.post('/:id/reviews', protect, productController.addReview);

// Admin routes
router.post('/', protect, admin, upload.array('images', 5), productController.create);
router.put('/:id', protect, admin, upload.array('images', 5), productController.update);
router.delete('/:id', protect, admin, productController.delete);

module.exports = router;
