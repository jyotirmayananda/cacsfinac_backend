// Script to hash a password
// Run: node scripts/hash-password.js

const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'Admin@Sudha9988';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('\n✅ Password hashed successfully!\n');
    console.log('Original Password:', password);
    console.log('Hashed Password:', hashedPassword);
    console.log('\n📋 Copy this hashed password to MongoDB:\n');
    console.log(hashedPassword);
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    process.exit(1);
  }
}

hashPassword();

