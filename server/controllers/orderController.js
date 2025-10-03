const Order = require('../models/Order');

// @desc    Get orders for current user
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images price');

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Admin: Analytics (timeseries + category breakdown)
// @route   GET /api/orders/admin/analytics
// @access  Private/Admin
exports.adminAnalytics = async (req, res) => {
  try {
    const { from, to, interval = 'day' } = req.query;
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = to ? new Date(to) : new Date();
    const dateFormat = interval === 'month' ? '%Y-%m' : (interval === 'week' ? '%G-%V' : '%Y-%m-%d');

    const [timeseries, byCategory] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
        { $unwind: '$prod' },
        {
          $group: {
            _id: '$prod.category',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { revenue: -1 } }
      ])
    ]);

    res.json({ success: true, data: { timeseries, byCategory }, meta: { from: start, to: end, interval } });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Error generating analytics' });
  }
};

// @desc    Admin: Get order status history
// @route   GET /api/orders/:id/history
// @access  Private/Admin
exports.adminGetHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('orderNumber statusHistory')
      .populate('statusHistory.changedBy', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: { orderNumber: order.orderNumber, history: order.statusHistory || [] } });
  } catch (error) {
    console.error('Admin get order history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching order history' });
  }
};

// @desc    Get single order (must belong to current user)
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===================== Admin Endpoints =====================

// @desc    Admin: Get all orders with optional filters
// @route   GET /api/orders/admin
// @access  Private/Admin
exports.adminGetAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, q, from, to } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (q) {
      filter.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: q, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: q, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name images price'),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNextPage: skip + orders.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Admin get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Admin: Update order status and tracking
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { status, trackingNumber, shippingMethod, notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) {
      order.status = status;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({ status, note: notes, changedAt: new Date(), changedBy: req.user.id });
    }
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (shippingMethod) order.shippingMethod = shippingMethod;
    if (notes !== undefined) order.notes = notes;

    if (status === 'shipped' && !order.estimatedDelivery) {
      order.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    await order.save();

    res.json({ success: true, message: 'Order updated', data: order });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Admin: Get label data for printing and QR generation
// @route   GET /api/orders/:id/label
// @access  Private/Admin
exports.adminGetLabelData = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const qrPayload = {
      type: 'delivery',
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber || null,
      totalAmount: order.totalAmount,
      ts: Date.now()
    };

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        shippingAddress: order.shippingAddress,
        items: order.items.map(it => ({ name: it.name, quantity: it.quantity })),
        totals: {
          subtotal: order.subtotal,
          shipping: order.shippingAmount,
          tax: order.taxAmount,
          total: order.totalAmount
        },
        qrPayload
      }
    });
  } catch (error) {
    console.error('Admin get label data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating label data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Admin: Sales report aggregation
// @route   GET /api/orders/admin/reports/sales
// @access  Private/Admin
exports.adminSalesReport = async (req, res) => {
  try {
    const { from, to, interval = 'day' } = req.query;
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = to ? new Date(to) : new Date();

    const dateFormat = interval === 'month' ? '%Y-%m' : (interval === 'week' ? '%G-%V' : '%Y-%m-%d');

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          orders: { $sum: 1 },
          items: { $sum: { $sum: '$items.quantity' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: result, meta: { from: start, to: end, interval } });
  } catch (error) {
    console.error('Admin sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sales report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
