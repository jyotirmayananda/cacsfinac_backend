// Script to create admin user
// Run: node scripts/create-admin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cacs';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cacsfinaccservices.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Sudha9988';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    
    console.log('🔐 Creating admin user with credentials:');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Name:', adminName);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      if (existingAdmin.isAdmin) {
        console.log('✅ Admin user already exists:', adminEmail);
        console.log('💡 To update password, delete the user first or update manually in database');
      } else {
        // Update existing user to admin
        existingAdmin.isAdmin = true;
        existingAdmin.password = adminPassword; // Will be hashed by pre-save hook
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin:', adminEmail);
      }
    } else {
      // Create new admin user
      const admin = new User({
        fullName: adminName,
        email: adminEmail,
        password: adminPassword,
        isAdmin: true
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('⚠️  Please change the password after first login!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

