const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { listUsers, setActive, updateUser } = require('../controllers/userAdminController');

// All routes here are admin-protected
router.use(adminAuth);

// GET /api/users
router.get('/', listUsers);

// PATCH /api/users/:id/active
router.patch('/:id/active', setActive);

// PUT /api/users/:id
router.put('/:id', updateUser);

module.exports = router;
