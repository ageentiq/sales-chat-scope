// Simple script to test API endpoints
import http from 'http';

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing Health Endpoint:');
    const health = await testEndpoint('/api/health');
    console.log(JSON.stringify(health, null, 2));
    console.log('');

    // Test conversations endpoint
    console.log('2. Testing Conversations Endpoint:');
    const conversations = await testEndpoint('/api/conversations');
    console.log(`Success: ${conversations.success}`);
    console.log(`Data count: ${conversations.data ? conversations.data.length : 0}`);
    if (conversations.data && conversations.data.length > 0) {
      console.log('Sample conversation:');
      console.log(JSON.stringify(conversations.data[0], null, 2));
    }
    console.log('');

    // Test unique conversations endpoint
    console.log('3. Testing Unique Conversations Endpoint:');
    const unique = await testEndpoint('/api/conversations/unique');
    console.log(`Success: ${unique.success}`);
    console.log(`Unique conversations count: ${unique.data ? unique.data.length : 0}`);
    if (unique.data && unique.data.length > 0) {
      console.log('Sample unique conversation:');
      console.log(JSON.stringify(unique.data[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
