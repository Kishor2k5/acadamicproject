const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentMethods,
  createCustomer
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Payment routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);
router.get('/methods', protect, getPaymentMethods);
router.post('/customer', protect, createCustomer);

module.exports = router;
