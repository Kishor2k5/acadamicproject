const express = require('express');
const router = express.Router();
const {
  getOrderTracking,
  updateOrderStatus,
  getUserOrders,
  bulkUpdateOrderStatus
} = require('../controllers/trackingController');
const { protect, admin } = require('../middleware/auth');

// Tracking routes
router.get('/order/:orderNumber', getOrderTracking);
router.get('/orders', protect, getUserOrders);
router.put('/order/:orderId/status', protect, admin, updateOrderStatus);
router.put('/orders/bulk-status', protect, admin, bulkUpdateOrderStatus);

module.exports = router;
