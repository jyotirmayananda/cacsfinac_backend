// Quick test script for login endpoint
// Run: node test-login.js

const fetch = require('node-fetch'); // If using Node.js < 18, install: npm install node-fetch@2

const API_URL = 'http://localhost:5000/api/auth/signin';

const testLogin = async () => {
  console.log('Testing login endpoint...\n');
  console.log('URL:', API_URL);
  
  // Replace with your test credentials
  const testData = {
    email: 'test@example.com', // Change this
    password: 'testpassword123' // Change this
  };

  console.log('Sending:', { email: testData.email, password: '***' });
  console.log('\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers));

    const data = await response.json();
    console.log('\nResponse:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Login successful!');
      console.log('Token:', data.token ? 'Received' : 'Missing');
      console.log('User:', data.user);
    } else {
      console.log('\n❌ Login failed');
      console.log('Message:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend is running: npm run dev');
    console.log('2. Backend is on port 5000');
    console.log('3. MongoDB is connected');
  }
};

testLogin();

