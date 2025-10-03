const User = require('../models/User');

// GET /api/users
// Admin-only: list users with optional search and pagination
exports.listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const q = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      User.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(q),
    ]);

    res.json({ success: true, data: items, pagination: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    console.error('listUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// PATCH /api/users/:id/active
// Admin-only: activate/deactivate user
exports.setActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive boolean required' });
    }
    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    console.error('setActive error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

// PUT /api/users/:id
// Admin-only: update user details (name, email, phone, role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (role !== undefined) update.role = role;

    // if email changed, ensure uniqueness
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: id } });
      if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};
