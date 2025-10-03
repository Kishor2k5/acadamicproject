const stripe = require('../config/stripe');
const Order = require('../models/Order');
const User = require('../models/User');

// Create payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId: orderId || '',
        userId: req.user?.id || ''
      }
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Payment intent ID required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order with payment information
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: paymentIntent.receipt_email
          };
          await order.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to confirm payment',
      error: error.message 
    });
  }
};

// Handle webhook events
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update order status if orderId is in metadata
      if (paymentIntent.metadata.orderId) {
        try {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order) {
            order.paymentStatus = 'paid';
            order.status = 'processing';
            order.paymentResult = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString()
            };
            await order.save();
          }
        } catch (error) {
          console.error('Error updating order after payment:', error);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      if (failedPayment.metadata.orderId) {
        try {
          const order = await Order.findById(failedPayment.metadata.orderId);
          if (order) {
            order.paymentStatus = 'failed';
            await order.save();
          }
        } catch (error) {
          console.error('Error updating order after payment failure:', error);
        }
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Get payment methods for user
const getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.stripeCustomerId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    res.status(200).json({
      success: true,
      data: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      }))
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment methods',
      error: error.message 
    });
  }
};

// Create or get Stripe customer
const createCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.stripeCustomerId) {
      // Customer already exists
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      return res.status(200).json({ success: true, data: customer });
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString()
      }
    });

    // Save customer ID to user
    user.stripeCustomerId = customer.id;
    await user.save();

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create customer',
      error: error.message 
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentMethods,
  createCustomer
};
