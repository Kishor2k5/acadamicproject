const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Quantity cannot exceed 10']
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String
    },
    image: {
      type: String
    },
    inStock: {
      type: Boolean,
      default: true
    }
  }],
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  shippingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Shipping amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  couponCode: {
    type: String,
    trim: true
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  appliedCoupon: {
    code: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountValue: Number,
    minimumAmount: Number
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  next();
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.taxAmount = this.subtotal * 0.08; // 8% tax
  
  // Calculate shipping (free over $100, otherwise $9.99)
  this.shippingAmount = this.subtotal > 100 ? 0 : 9.99;
  
  // Apply discount if coupon is applied
  let finalSubtotal = this.subtotal;
  if (this.appliedCoupon) {
    if (this.appliedCoupon.discountType === 'percentage') {
      this.discountAmount = (this.subtotal * this.appliedCoupon.discountValue) / 100;
    } else {
      this.discountAmount = this.appliedCoupon.discountValue;
    }
    finalSubtotal = this.subtotal - this.discountAmount;
  }
  
  this.totalAmount = finalSubtotal + this.taxAmount + this.shippingAmount;
  return this;
};

// Method to add item to cart
cartSchema.methods.addItem = function(productData) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productData.product.toString() && 
            item.size === productData.size
  );

  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    this.items[existingItemIndex].quantity += productData.quantity;
    if (this.items[existingItemIndex].quantity > 10) {
      this.items[existingItemIndex].quantity = 10;
    }
  } else {
    // Add new item
    this.items.push(productData);
  }
  
  this.calculateTotals();
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, size, quantity) {
  const itemIndex = this.items.findIndex(
    item => item.product.toString() === productId && item.size === size
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = Math.min(quantity, 10);
    }
    this.calculateTotals();
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId, size) {
  const itemIndex = this.items.findIndex(
    item => item.product.toString() === productId && item.size === size
  );

  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    this.calculateTotals();
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.calculateTotals();
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(coupon) {
  this.appliedCoupon = coupon;
  this.couponCode = coupon.code;
  this.calculateTotals();
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.appliedCoupon = null;
  this.couponCode = null;
  this.discountAmount = 0;
  this.calculateTotals();
  return this.save();
};

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for checking if cart is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

module.exports = mongoose.model('Cart', cartSchema); 