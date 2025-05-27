// 🚀 QUICK PERFORMANCE FIX TEST
// Tests the ultra-fast API and all optimizations

const API_BASE = 'http://localhost:3000'

async function testQuickFixes() {
  console.log('🚀 TESTING QUICK PERFORMANCE FIXES')
  console.log('=' * 50)

  // Test the ultra-fast API route
  const tests = [
    { name: 'Ultra-Fast API', url: '/api/posts/route-fast?page=1&limit=3' },
    { name: 'Original API (for comparison)', url: '/api/posts?page=1&limit=3' },
  ]

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`)
    console.log(`📡 URL: ${API_BASE}${test.url}`)
    
    // Test 3 times for cache effectiveness
    for (let i = 1; i <= 3; i++) {
      const startTime = Date.now()
      
      try {
        const response = await fetch(`${API_BASE}${test.url}`)
        const duration = Date.now() - startTime
        
        if (response.ok) {
          const data = await response.json()
          const cacheStatus = response.headers.get('X-Cache') || 'UNKNOWN'
          const queryTime = response.headers.get('X-Query-Time') || 'UNKNOWN'
          
          let status = '✅'
          if (duration > 200) status = '⚠️'
          if (duration > 1000) status = '🐌'
          if (duration > 3000) status = '🚨'
          
          console.log(`  Run ${i}: ${duration}ms ${status} | Cache: ${cacheStatus} | Posts: ${data.posts?.length || 0}`)
        } else {
          console.log(`  Run ${i}: ${duration}ms - ❌ Failed (${response.status})`)
        }
      } catch (error) {
        const duration = Date.now() - startTime
        console.log(`  Run ${i}: ${duration}ms - ❌ Error: ${error.message}`)
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log('\n📊 PERFORMANCE TARGETS:')
  console.log('✅ Cache HIT: < 50ms')
  console.log('⚠️ Cache MISS: < 200ms (target with optimizations)')
  console.log('🐌 Slow: 200-1000ms')
  console.log('🚨 Critical: > 1000ms')

  console.log('\n🎯 EXPECTED IMPROVEMENTS:')
  console.log('1. ✅ Cache hits should be < 50ms')
  console.log('2. ⚡ Database indexes should reduce cold cache to < 500ms')
  console.log('3. 🚀 Ultra-fast API should be faster than original')
  console.log('4. 📈 Performance should improve with each run (caching)')

  console.log('\n🏁 Quick fix test completed!')
}

// Run the test
testQuickFixes().catch(console.error) 