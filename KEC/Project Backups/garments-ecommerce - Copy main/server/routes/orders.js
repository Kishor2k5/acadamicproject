const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// All order routes require authentication
router.use(protect);

// Admin routes (must be before parameterized routes)
router.get('/admin', admin, orderController.adminGetAll);
router.get('/admin/reports/sales', admin, orderController.adminSalesReport);
router.get('/admin/analytics', admin, orderController.adminAnalytics);

// Get current user's orders
router.get('/', orderController.getMyOrders);

// Admin label + status routes
router.get('/:id/label', admin, orderController.adminGetLabelData);
router.patch('/:id/status', admin, orderController.adminUpdateStatus);
router.get('/:id/history', admin, orderController.adminGetHistory);

// Get single order by id (must belong to user)
router.get('/:id', orderController.getOrderById);

module.exports = router;
