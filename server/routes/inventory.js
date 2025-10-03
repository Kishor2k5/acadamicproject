const express = require('express');
const router = express.Router();
const {
  getInventoryOverview,
  updateStock,
  bulkUpdateStock,
  getLowStockProducts
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/auth');

// Inventory routes (Admin only)
router.get('/overview', protect, admin, getInventoryOverview);
router.get('/low-stock', protect, admin, getLowStockProducts);
router.put('/stock/:productId', protect, admin, updateStock);
router.put('/stock/bulk', protect, admin, bulkUpdateStock);

module.exports = router;
