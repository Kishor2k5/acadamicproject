require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const DEFAULT_USER_COUNT = parseInt(process.argv[2], 10) || 3; // e.g. node scripts/seedUsersAndOrders.js 5
const ORDERS_PER_USER = parseInt(process.argv[3], 10) || 2;    // e.g. node scripts/seedUsersAndOrders.js 5 3

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFrom(arr, fallback) {
  if (Array.isArray(arr) && arr.length > 0) return pickRandom(arr);
  return fallback;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAddress(name) {
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ') || 'User';
  return {
    firstName,
    lastName,
    address: `${randomInt(100, 999)} Market Street`,
    city: pickRandom(['San Francisco', 'New York', 'Austin', 'Chicago', 'Seattle']),
    state: pickRandom(['CA', 'NY', 'TX', 'IL', 'WA']),
    zipCode: `${randomInt(10000, 99999)}`,
    country: 'United States',
    phone: `+1-415-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
  };
}

async function main() {
  await connectDB();

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.error('[seed] No products found. Please seed products first, then re-run this script.');
    await mongoose.connection.close();
    process.exit(1);
  }

  const products = await Product.find({ isActive: true }).limit(50);

  console.log(`[seed] Creating ${DEFAULT_USER_COUNT} users with ${ORDERS_PER_USER} orders each...`);

  for (let i = 1; i <= DEFAULT_USER_COUNT; i++) {
    const name = `Demo User ${Date.now()}-${i}`;
    const email = `demo_user_${Date.now()}_${i}@example.com`;

    let user;
    try {
      user = new User({
        name,
        email,
        password: 'Password123', // pre-save hook will hash
        role: 'user',
        isActive: true,
      });
      await user.save();
      console.log(`[seed] Created user: ${user.name} <${user.email}>`);
    } catch (e) {
      console.error('[seed] Failed to create user', email, e.message);
      continue; // proceed with next user
    }

    for (let j = 1; j <= ORDERS_PER_USER; j++) {
      const items = [];
      const itemCount = randomInt(1, Math.min(3, Math.max(1, products.length)));
      const usedIndexes = new Set();

      for (let k = 0; k < itemCount; k++) {
        // ensure different products per order where possible
        let idx;
        let guard = 0;
        do {
          idx = Math.floor(Math.random() * products.length);
          guard++;
        } while (usedIndexes.has(idx) && guard < 10);
        usedIndexes.add(idx);

        const p = products[idx];
        items.push({
          product: p._id,
          name: p.name,
          price: p.price,
          quantity: randomInt(1, 3),
          size: randomFrom(p.sizes, 'M'),
          color: randomFrom(p.colors, 'Black'),
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '',
        });
      }

      const shipping = makeAddress(user.name);

      const order = new Order({
        user: user._id,
        items,
        shippingAddress: shipping,
        billingAddress: {
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.zipCode,
          country: shipping.country,
        },
        paymentMethod: pickRandom(['credit_card', 'debit_card', 'paypal']),
        shippingAmount: pickRandom([4.99, 6.99, 0]),
        status: pickRandom(['pending', 'processing', 'delivered']),
        paymentStatus: pickRandom(['pending', 'paid']),
        shippingMethod: pickRandom(['standard', 'express']),
        notes: Math.random() > 0.7 ? 'Gift wrap this order, please.' : undefined,
        isGift: Math.random() > 0.8,
        giftMessage: Math.random() > 0.9 ? 'Happy Birthday!' : undefined,
      });

      order.calculateTotals();

      try {
        await order.save();
        console.log(`[seed] Created order ${order.orderNumber} for ${user.email} with ${items.length} item(s), total $${order.totalAmount.toFixed(2)}`);
      } catch (e) {
        console.error('[seed] Failed to create order for', user.email, e.message);
      }
    }
  }

  await mongoose.connection.close();
  console.log('[seed] Done.');
}

main().catch(async (err) => {
  console.error('[seed] Unexpected error:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
