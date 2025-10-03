const express = require('express');
const router = express.Router();
const {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches
} = require('../controllers/searchController');

// Search routes
router.get('/products', searchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);

module.exports = router;
