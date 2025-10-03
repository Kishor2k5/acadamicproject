const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// Get order tracking information
const getOrderTracking = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber })
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission to view this order
    if (req.user && req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      shippingMethod: order.shippingMethod,
      statusHistory: order.statusHistory.map(history => ({
        status: history.status,
        note: history.note,
        date: history.changedAt,
        changedBy: history.changedBy
      })),
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
        price: item.price
      })),
      shippingAddress: order.shippingAddress,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    };

    res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order tracking',
      error: error.message
    });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, trackingNumber } = req.body;

    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;

    // Update order status
    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Add to status history
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
      changedAt: new Date(),
      changedBy: req.user.id
    });

    // Set estimated delivery for shipped orders
    if (status === 'shipped' && !order.estimatedDelivery) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
      order.estimatedDelivery = deliveryDate;
    }

    await order.save();

    // Send email notification for status changes
    if (oldStatus !== status) {
      try {
        let emailTemplate = null;
        
        switch (status) {
          case 'shipped':
            emailTemplate = 'orderShipped';
            break;
          case 'delivered':
            emailTemplate = 'orderDelivered';
            break;
        }

        if (emailTemplate) {
          await sendEmail(order.user.email, emailTemplate, {
            order,
            user: order.user
          });
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get all orders for a user
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    let query = { user: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name images')
      .select('-statusHistory'); // Exclude detailed history for list view

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      estimatedDelivery: order.estimatedDelivery,
      trackingNumber: order.trackingNumber,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price
      }))
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
};

// Generate tracking number
const generateTrackingNumber = () => {
  const prefix = 'GF';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Bulk update order statuses (Admin only)
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, note } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
    }

    const updatePromises = orderIds.map(async (orderId) => {
      const order = await Order.findById(orderId).populate('user', 'name email');
      if (!order) return null;

      const oldStatus = order.status;
      order.status = status;

      // Generate tracking number for shipped orders
      if (status === 'shipped' && !order.trackingNumber) {
        order.trackingNumber = generateTrackingNumber();
      }

      // Add to status history
      order.statusHistory.push({
        status,
        note: note || `Bulk status update to ${status}`,
        changedAt: new Date(),
        changedBy: req.user.id
      });

      // Set estimated delivery for shipped orders
      if (status === 'shipped' && !order.estimatedDelivery) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        order.estimatedDelivery = deliveryDate;
      }

      await order.save();

      // Send email notification
      if (oldStatus !== status && (status === 'shipped' || status === 'delivered')) {
        try {
          const emailTemplate = status === 'shipped' ? 'orderShipped' : 'orderDelivered';
          await sendEmail(order.user.email, emailTemplate, {
            order,
            user: order.user
          });
        } catch (emailError) {
          console.error('Email notification failed for order:', order.orderNumber, emailError);
        }
      }

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber
      };
    });

    const results = await Promise.all(updatePromises);
    const successfulUpdates = results.filter(result => result !== null);

    res.status(200).json({
      success: true,
      message: `${successfulUpdates.length} orders updated successfully`,
      data: successfulUpdates
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update orders',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  getOrderTracking,
  updateOrderStatus,
  getUserOrders,
  bulkUpdateOrderStatus,
  generateTrackingNumber
};
