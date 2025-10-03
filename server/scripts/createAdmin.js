const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/g_fresh', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'G Fresh Admin',
      email: process.env.ADMIN_EMAIL || 'admin@gfresh.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    console.log('✅ Default admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123456');
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createDefaultAdmin();
