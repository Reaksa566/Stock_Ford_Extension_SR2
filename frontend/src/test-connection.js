// Test script to check backend connection
const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test login endpoint
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login test:', loginResponse.status, loginData);
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
  }
};

// Run the test
testBackendConnection();