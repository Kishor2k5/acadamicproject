const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/g_fresh', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Remove old admin user if exists
    const oldAdmin = await User.findOne({ email: 'admin@gfresh.com' });
    if (oldAdmin) {
      await User.findByIdAndDelete(oldAdmin._id);
      console.log('✅ Old admin user removed:', oldAdmin.email);
    }

    // Check if new admin already exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.email);
      process.exit(0);
    }

    // Create new admin user
    const admin = await User.create({
      name: 'G Fresh Admin',
      email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
      password: process.env.ADMIN_PASSWORD || '123456',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    console.log('✅ New admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || '123456');
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin user:', error.message);
    process.exit(1);
  }
};

updateAdminUser();
