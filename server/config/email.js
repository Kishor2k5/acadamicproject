const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
        
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        </div>

        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Items Ordered</h3>
          ${order.items.map(item => `
            <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
              <p><strong>${item.name}</strong></p>
              <p>Size: ${item.size} | Quantity: ${item.quantity} | Price: ₹${item.price}</p>
            </div>
          `).join('')}
        </div>

        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
          <p>${order.shippingAddress.address}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
          <p>${order.shippingAddress.country}</p>
        </div>

        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with us!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  orderShipped: (order, user) => ({
    subject: `Your Order Has Shipped - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Order Has Shipped!</h2>
        <p>Hi ${user.name},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Shipping Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Will be updated soon'}</p>
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Within 7 business days'}</p>
        </div>

        <p>You can track your package using the tracking number provided above.</p>
        <p>Thank you for your business!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  orderDelivered: (order, user) => ({
    subject: `Order Delivered - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Delivered Successfully!</h2>
        <p>Hi ${user.name},</p>
        <p>Your order has been delivered successfully!</p>
        
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Delivered On:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>We hope you love your purchase! If you have any issues, please contact our support team.</p>
        <p>Don't forget to leave a review for the products you purchased.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  }),

  lowStock: (product) => ({
    subject: `Low Stock Alert - ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Low Stock Alert</h2>
        <p>The following product is running low on stock:</p>
        
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>${product.name}</h3>
          <p><strong>Current Stock:</strong> ${product.stock} units</p>
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
        </div>

        <p>Please restock this item to avoid stockouts.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated alert from your inventory management system.
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data.order || data.product, data.user);
    
    const mailOptions = {
      from: `"G Fresh Store" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};
