const Product = require('../models/Product');
const { sendEmail } = require('../config/email');
const cron = require('node-cron');

// Get inventory overview
const getInventoryOverview = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, lowStock = false, outOfStock = false } = req.query;

    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Stock filters
    if (lowStock === 'true') {
      query.stock = { $lte: 10, $gt: 0 }; // Low stock threshold: 10 or less
    } else if (outOfStock === 'true') {
      query.stock = 0;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort({ stock: 1, name: 1 }) // Sort by stock ascending, then name
      .skip(skip)
      .limit(parseInt(limit))
      .select('name category stock price sku images isActive');

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // Get inventory statistics
    const stats = await getInventoryStats();

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        stats
      }
    });
  } catch (error) {
    console.error('Inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inventory overview',
      error: error.message
    });
  }
};

// Get inventory statistics
const getInventoryStats = async () => {
  try {
    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalValue,
      categoryStats
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lte: 10, $gt: 0 }, isActive: true }),
      Product.countDocuments({ stock: 0, isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } }
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          lowStock: { 
            $sum: { 
              $cond: [{ $and: [{ $lte: ['$stock', 10] }, { $gt: ['$stock', 0] }] }, 1, 0] 
            } 
          },
          outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } }
        }},
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue: totalValue[0]?.total || 0,
      categoryBreakdown: categoryStats
    };
  } catch (error) {
    console.error('Inventory stats error:', error);
    return {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalInventoryValue: 0,
      categoryBreakdown: []
    };
  }
};

// Update product stock
const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const oldStock = product.stock;
    let newStock;

    switch (operation) {
      case 'add':
        newStock = oldStock + parseInt(stock);
        break;
      case 'subtract':
        newStock = Math.max(0, oldStock - parseInt(stock));
        break;
      case 'set':
      default:
        newStock = parseInt(stock);
        break;
    }

    product.stock = newStock;
    await product.save();

    // Log stock change
    console.log(`Stock updated for ${product.name}: ${oldStock} -> ${newStock}`);

    // Check if product is now low stock and send alert
    if (newStock <= 10 && newStock > 0 && oldStock > 10) {
      await sendLowStockAlert(product);
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        productId: product._id,
        name: product.name,
        oldStock,
        newStock,
        operation
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Bulk stock update
const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, stock, operation }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    const results = [];
    const lowStockAlerts = [];

    for (const update of updates) {
      try {
        const { productId, stock, operation = 'set' } = update;
        const product = await Product.findById(productId);
        
        if (!product) {
          results.push({
            productId,
            success: false,
            error: 'Product not found'
          });
          continue;
        }

        const oldStock = product.stock;
        let newStock;

        switch (operation) {
          case 'add':
            newStock = oldStock + parseInt(stock);
            break;
          case 'subtract':
            newStock = Math.max(0, oldStock - parseInt(stock));
            break;
          case 'set':
          default:
            newStock = parseInt(stock);
            break;
        }

        product.stock = newStock;
        await product.save();

        results.push({
          productId,
          name: product.name,
          oldStock,
          newStock,
          operation,
          success: true
        });

        // Check for low stock
        if (newStock <= 10 && newStock > 0 && oldStock > 10) {
          lowStockAlerts.push(product);
        }
      } catch (error) {
        results.push({
          productId: update.productId,
          success: false,
          error: error.message
        });
      }
    }

    // Send low stock alerts
    for (const product of lowStockAlerts) {
      await sendLowStockAlert(product);
    }

    const successCount = results.filter(r => r.success).length;

    res.status(200).json({
      success: true,
      message: `${successCount} products updated successfully`,
      data: {
        results,
        totalUpdates: updates.length,
        successfulUpdates: successCount,
        failedUpdates: updates.length - successCount
      }
    });
  } catch (error) {
    console.error('Bulk update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update stock',
      error: error.message
    });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.find({
      stock: { $lte: parseInt(threshold), $gt: 0 },
      isActive: true
    })
    .sort({ stock: 1 })
    .select('name category stock price sku images');

    res.status(200).json({
      success: true,
      data: {
        products: lowStockProducts,
        count: lowStockProducts.length,
        threshold: parseInt(threshold)
      }
    });
  } catch (error) {
    console.error('Low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get low stock products',
      error: error.message
    });
  }
};

// Send low stock alert email
const sendLowStockAlert = async (product) => {
  try {
    // Get admin emails (you might want to store these in a settings collection)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gfresh.com';
    
    await sendEmail(adminEmail, 'lowStock', { product });
    console.log(`Low stock alert sent for product: ${product.name}`);
  } catch (error) {
    console.error('Failed to send low stock alert:', error);
  }
};

// Stock movement tracking
const trackStockMovement = async (productId, oldStock, newStock, reason, userId) => {
  // This could be implemented with a separate StockMovement model
  // For now, we'll just log it
  console.log(`Stock Movement - Product: ${productId}, ${oldStock} -> ${newStock}, Reason: ${reason}, User: ${userId}`);
};

// Automated stock alerts (runs daily)
const scheduleStockAlerts = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running daily stock alert check...');
      
      const lowStockProducts = await Product.find({
        stock: { $lte: 10, $gt: 0 },
        isActive: true
      }).select('name category stock sku');

      if (lowStockProducts.length > 0) {
        // Send consolidated low stock report
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@gfresh.com';
        
        // You could create a consolidated email template for multiple products
        for (const product of lowStockProducts) {
          await sendLowStockAlert(product);
        }
        
        console.log(`Daily stock alert sent for ${lowStockProducts.length} products`);
      }
    } catch (error) {
      console.error('Daily stock alert error:', error);
    }
  });
};

// Initialize scheduled tasks
scheduleStockAlerts();

module.exports = {
  getInventoryOverview,
  getInventoryStats,
  updateStock,
  bulkUpdateStock,
  getLowStockProducts,
  sendLowStockAlert,
  trackStockMovement
};
