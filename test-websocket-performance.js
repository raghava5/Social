const io = require('socket.io-client');

async function testWebSocketPerformance() {
  console.log('🚀 Testing WebSocket Performance and Connection...\n');
  
  const startTime = Date.now();
  
  try {
    // Test 1: WebSocket Connection
    console.log('📡 Test 1: WebSocket Connection');
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
      timeout: 5000
    });

    const connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout after 5 seconds'));
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        const connectionTime = Date.now() - startTime;
        console.log(`✅ WebSocket connected in ${connectionTime}ms`);
        resolve(connectionTime);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    await connectionPromise;

    // Test 2: Authentication
    console.log('\n🔐 Test 2: Authentication');
    const authStartTime = Date.now();
    
    const authPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, 3000);

      socket.emit('authenticate', {
        userId: 'test-user-123',
        token: 'test-token'
      });

      socket.on('authenticated', () => {
        clearTimeout(timeout);
        const authTime = Date.now() - authStartTime;
        console.log(`✅ Authenticated in ${authTime}ms`);
        resolve(authTime);
      });
    });

    await authPromise;

    // Test 3: API Performance
    console.log('\n⚡ Test 3: API Performance');
    
    const apiTests = [
      { name: 'Posts API', url: '/api/posts?page=1&limit=5' },
      { name: 'Database Test', url: '/api/db-test' },
    ];

    for (const test of apiTests) {
      const apiStartTime = Date.now();
      try {
        const response = await fetch(`http://localhost:3000${test.url}`);
        const apiTime = Date.now() - apiStartTime;
        
        if (response.ok) {
          console.log(`✅ ${test.name}: ${apiTime}ms`);
          if (apiTime > 2000) {
            console.log(`⚠️  Warning: ${test.name} took over 2 seconds`);
          }
        } else {
          console.log(`❌ ${test.name}: Failed (${response.status})`);
        }
      } catch (error) {
        const apiTime = Date.now() - apiStartTime;
        console.log(`❌ ${test.name}: Error after ${apiTime}ms - ${error.message}`);
      }
    }

    // Test 4: Real-time Messaging
    console.log('\n📨 Test 4: Real-time Messaging');
    const messageStartTime = Date.now();
    
    const messagePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message test timeout'));
      }, 3000);

      // Listen for echo
      socket.on('test_echo', (data) => {
        clearTimeout(timeout);
        const messageTime = Date.now() - messageStartTime;
        console.log(`✅ Message echo received in ${messageTime}ms`);
        resolve(messageTime);
      });

      // Send test message
      socket.emit('test_message', { content: 'Hello WebSocket!' });
    });

    try {
      await messagePromise;
    } catch (error) {
      console.log(`⚠️  Message test failed: ${error.message}`);
    }

    // Test 5: Connection Stability
    console.log('\n🔒 Test 5: Connection Stability');
    console.log(`Socket ID: ${socket.id}`);
    console.log(`Connected: ${socket.connected}`);
    console.log(`Transport: ${socket.io.engine.transport.name}`);

    socket.disconnect();
    
    const totalTime = Date.now() - startTime;
    console.log(`\n🎉 Total test duration: ${totalTime}ms`);
    console.log('\n📊 Performance Summary:');
    console.log('- WebSocket connection should be < 1000ms');
    console.log('- API responses should be < 2000ms');
    console.log('- Real-time messaging should be < 500ms');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWebSocketPerformance()
    .then(() => {
      console.log('\n✅ All tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testWebSocketPerformance }; 