import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for monitoring
export let errorRate = new Rate('errors');
export let responseTime = new Trend('response_time');
export let feedLoadTime = new Trend('feed_load_time');
export let likeActionTime = new Trend('like_action_time');
export let commentActionTime = new Trend('comment_action_time');
export let websocketConnections = new Counter('websocket_connections');

// Test configuration for different phases
export let options = {
  stages: [
    // Ramp up to simulate user growth
    { duration: '5m', target: 100 },     // Start with 100 users
    { duration: '10m', target: 1000 },   // Scale to 1K users
    { duration: '15m', target: 10000 },  // Scale to 10K users
    { duration: '20m', target: 50000 },  // Scale to 50K users
    { duration: '30m', target: 100000 }, // Scale to 100K users (1/10,000 of 1B)
    { duration: '10m', target: 100000 }, // Sustain peak load
    { duration: '15m', target: 0 },      // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'errors': ['rate<0.1'],               // Error rate under 10%
    'feed_load_time': ['p(90)<3000'],     // Feed loads under 3s for 90% of users
    'like_action_time': ['p(95)<500'],    // Like actions under 500ms
    'comment_action_time': ['p(95)<1000'], // Comments under 1s
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:3000';

// Test data generators
function generateUser() {
  const userId = Math.floor(Math.random() * 1000000000); // Simulate 1B user IDs
  return {
    id: `user_${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    token: `fake_jwt_token_${userId}`
  };
}

function generatePost() {
  const postId = Math.floor(Math.random() * 100000000); // 100M posts
  const content = [
    'Just had an amazing day! 🌟',
    'Working on something exciting today!',
    'Beautiful sunset this evening 🌅',
    'Coffee and coding - perfect combo ☕',
    'Weekend vibes are strong! 🎉'
  ];
  
  return {
    id: `post_${postId}`,
    content: content[Math.floor(Math.random() * content.length)],
    authorId: `user_${Math.floor(Math.random() * 1000000)}`,
    spoke: ['Technology', 'Lifestyle', 'Art', 'Music', 'Sports'][Math.floor(Math.random() * 5)]
  };
}

// Authentication simulation
function authenticate(user) {
  const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: 'testpass123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'auth successful': (r) => r.status === 200,
    'auth response time OK': (r) => r.timings.duration < 1000,
  });
  
  return response.json('token') || user.token;
}

// Feed loading test
function loadFeed(token) {
  const start = new Date();
  
  const response = http.get(`${BASE_URL}/api/feed`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  const duration = new Date() - start;
  feedLoadTime.add(duration);
  
  const success = check(response, {
    'feed loaded': (r) => r.status === 200,
    'feed has posts': (r) => r.json('posts') && r.json('posts').length > 0,
    'feed response time OK': (r) => r.timings.duration < 3000,
  });
  
  if (!success) errorRate.add(1);
  
  return response.json('posts') || [];
}

// Like action test
function likePost(token, postId) {
  const start = new Date();
  
  const response = http.post(`${BASE_URL}/api/posts/${postId}/like`, null, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const duration = new Date() - start;
  likeActionTime.add(duration);
  
  const success = check(response, {
    'like successful': (r) => r.status === 200,
    'like response time OK': (r) => r.timings.duration < 500,
  });
  
  if (!success) errorRate.add(1);
}

// Comment action test
function commentOnPost(token, postId) {
  const start = new Date();
  
  const comments = [
    'Great post!',
    'Totally agree!',
    'Thanks for sharing!',
    'Awesome content 👍',
    'Love this!'
  ];
  
  const response = http.post(`${BASE_URL}/api/posts/${postId}/comment`, JSON.stringify({
    content: comments[Math.floor(Math.random() * comments.length)]
  }), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const duration = new Date() - start;
  commentActionTime.add(duration);
  
  const success = check(response, {
    'comment successful': (r) => r.status === 200,
    'comment response time OK': (r) => r.timings.duration < 1000,
  });
  
  if (!success) errorRate.add(1);
}

// WebSocket connection test
function testWebSocket(token) {
  const url = `${WS_URL}/socket.io/?EIO=4&transport=websocket`;
  
  const response = ws.connect(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }, function (socket) {
    websocketConnections.add(1);
    
    socket.on('open', function open() {
      console.log('WebSocket connected');
      
      // Authenticate via WebSocket
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: token
      }));
    });
    
    socket.on('message', function (message) {
      const data = JSON.parse(message);
      
      check(data, {
        'websocket message received': () => true,
      });
    });
    
    socket.on('error', function (e) {
      if (e.error() != "websocket: close sent") {
        console.log('WebSocket error: ', e.error());
        errorRate.add(1);
      }
    });
    
    // Keep connection alive for realistic duration
    sleep(Math.random() * 30 + 10); // 10-40 seconds
  });
  
  check(response, {
    'websocket connected': (r) => r && r.status === 101,
  });
}

// Search functionality test
function searchContent(token, query) {
  const response = http.get(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  
  check(response, {
    'search successful': (r) => r.status === 200,
    'search response time OK': (r) => r.timings.duration < 2000,
  });
  
  if (response.status !== 200) errorRate.add(1);
}

// Media upload test
function uploadMedia(token) {
  const formData = {
    'file': http.file(http.file('test-image.jpg'), 'test-image.jpg', 'image/jpeg'),
    'type': 'image'
  };
  
  const response = http.post(`${BASE_URL}/api/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  check(response, {
    'upload successful': (r) => r.status === 200,
    'upload response time OK': (r) => r.timings.duration < 5000,
  });
  
  if (response.status !== 200) errorRate.add(1);
}

// Main test scenario
export default function () {
  const user = generateUser();
  const token = authenticate(user);
  
  // Simulate realistic user behavior patterns
  const userBehavior = Math.random();
  
  if (userBehavior < 0.8) {
    // 80% of users: Browse and interact
    
    // Load feed (high frequency action)
    const posts = loadFeed(token);
    sleep(1 + Math.random() * 2); // 1-3 seconds reading
    
    if (posts.length > 0) {
      // Like some posts (60% chance)
      if (Math.random() < 0.6) {
        const randomPost = posts[Math.floor(Math.random() * Math.min(posts.length, 5))];
        likePost(token, randomPost.id);
        sleep(0.5);
      }
      
      // Comment on posts (20% chance)
      if (Math.random() < 0.2) {
        const randomPost = posts[Math.floor(Math.random() * Math.min(posts.length, 3))];
        commentOnPost(token, randomPost.id);
        sleep(1);
      }
    }
    
    // Search content (30% chance)
    if (Math.random() < 0.3) {
      const searchQueries = ['technology', 'art', 'music', 'sports', 'travel'];
      const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
      searchContent(token, query);
      sleep(1);
    }
    
  } else if (userBehavior < 0.95) {
    // 15% of users: Real-time features (WebSocket)
    testWebSocket(token);
    
  } else {
    // 5% of users: Content creators (upload media)
    uploadMedia(token);
    sleep(2);
  }
  
  // Random sleep to simulate real user behavior
  sleep(Math.random() * 5 + 1); // 1-6 seconds between actions
}

// Teardown function for cleanup
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total errors: ${errorRate.values}`);
  console.log(`Average response time: ${responseTime.avg}ms`);
}

// Health check test
export function healthCheck() {
  const response = http.get(`${BASE_URL}/api/health`);
  
  check(response, {
    'health check passed': (r) => r.status === 200,
    'health check response time OK': (r) => r.timings.duration < 100,
  });
} 