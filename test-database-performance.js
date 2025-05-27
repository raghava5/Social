// 🚀 ADVANCED DATABASE PERFORMANCE TEST
// Tests the optimized posts API with batch aggregation and cursor-based pagination

const API_BASE = 'http://localhost:3000'

async function testAPIPerformance() {
  console.log('🚀 ADVANCED DATABASE PERFORMANCE TEST - STARTING')
  console.log('=' * 60)

  const tests = [
    { name: 'Posts API - Page 1 (Offset)', url: '/api/posts?page=1&limit=10' },
    { name: 'Posts API - Page 2 (Offset)', url: '/api/posts?page=2&limit=10' },
    { name: 'Posts API - With Spoke Filter', url: '/api/posts?page=1&limit=10&spoke=fitness' },
    { name: 'Posts API - With Type Filter', url: '/api/posts?page=1&limit=10&type=user-post' },
    { name: 'Posts API - Combined Filters', url: '/api/posts?page=1&limit=10&spoke=fitness&type=user-post' },
  ]

  const results = []
  let firstPageCursor = null

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}`)
    console.log(`📡 URL: ${API_BASE}${test.url}`)
    
    // Run test 3 times to get average
    const times = []
    
    for (let i = 1; i <= 3; i++) {
      const startTime = Date.now()
      
      try {
        const response = await fetch(`${API_BASE}${test.url}`)
        const duration = Date.now() - startTime
        
        if (response.ok) {
          const data = await response.json()
          times.push(duration)
          
          console.log(`  Run ${i}: ${duration}ms - ✅ Success (${data.posts?.length || 0} posts)`)
          
          if (i === 1) {
            // Store cursor from first page for cursor testing
            if (test.name.includes('Page 1') && data.pagination?.nextCursor) {
              firstPageCursor = data.pagination.nextCursor
            }
            
            // Check cache header on first run
            const cacheStatus = response.headers.get('X-Cache') || 'UNKNOWN'
            const queryTime = response.headers.get('X-Query-Time') || 'UNKNOWN'
            console.log(`  Cache Status: ${cacheStatus} | Query Time: ${queryTime}`)
          }
        } else {
          console.log(`  Run ${i}: ${duration}ms - ❌ Failed (${response.status})`)
        }
      } catch (error) {
        const duration = Date.now() - startTime
        console.log(`  Run ${i}: ${duration}ms - ❌ Error: ${error.message}`)
      }
    }
    
    if (times.length > 0) {
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)
      
      results.push({
        name: test.name,
        avgTime,
        minTime,
        maxTime,
        times
      })
      
      // Performance assessment  
      let status = '✅ EXCELLENT'
      if (avgTime > 300) status = '⚠️ SLOW'
      if (avgTime > 1000) status = '🐌 VERY SLOW' 
      if (avgTime > 2000) status = '🚨 CRITICAL'
      
      console.log(`  📊 Average: ${avgTime}ms | Min: ${minTime}ms | Max: ${maxTime}ms | ${status}`)
    }
  }

  // 🚀 TEST CURSOR-BASED PAGINATION
  if (firstPageCursor) {
    console.log('\n🔄 Testing Cursor-Based Pagination...')
    console.log(`📡 Using cursor: ${firstPageCursor}`)
    
    const cursorUrl = `/api/posts?cursor=${firstPageCursor}&limit=10`
    const times = []
    
    for (let i = 1; i <= 3; i++) {
      const startTime = Date.now()
      
      try {
        const response = await fetch(`${API_BASE}${cursorUrl}`)
        const duration = Date.now() - startTime
        
        if (response.ok) {
          const data = await response.json()
          times.push(duration)
          
          console.log(`  Cursor Run ${i}: ${duration}ms - ✅ Success (${data.posts?.length || 0} posts)`)
          
          if (i === 1) {
            const cacheStatus = response.headers.get('X-Cache') || 'UNKNOWN'
            const queryTime = response.headers.get('X-Query-Time') || 'UNKNOWN'
            console.log(`  Cache Status: ${cacheStatus} | Query Time: ${queryTime}`)
          }
        } else {
          console.log(`  Cursor Run ${i}: ${duration}ms - ❌ Failed (${response.status})`)
        }
      } catch (error) {
        const duration = Date.now() - startTime
        console.log(`  Cursor Run ${i}: ${duration}ms - ❌ Error: ${error.message}`)
      }
    }
    
    if (times.length > 0) {
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)
      
      results.push({
        name: 'Cursor-Based Pagination',
        avgTime,
        minTime,
        maxTime,
        times
      })
      
      let status = '✅ EXCELLENT'
      if (avgTime > 300) status = '⚠️ SLOW'
      if (avgTime > 1000) status = '🐌 VERY SLOW'
      
      console.log(`  📊 Cursor Average: ${avgTime}ms | Min: ${minTime}ms | Max: ${maxTime}ms | ${status}`)
    }
  }

  // Summary
  console.log('\n' + '=' * 60)
  console.log('📊 ADVANCED PERFORMANCE SUMMARY')
  console.log('=' * 60)
  
  results.forEach(result => {
    let status = '✅'
    if (result.avgTime > 300) status = '⚠️'
    if (result.avgTime > 1000) status = '🐌'
    if (result.avgTime > 2000) status = '🚨'
    
    console.log(`${status} ${result.name}: ${result.avgTime}ms avg`)
  })

  // Performance benchmarks
  console.log('\n📈 ADVANCED PERFORMANCE BENCHMARKS:')
  console.log('✅ Excellent: < 300ms (Target for batch optimization)')
  console.log('⚠️ Acceptable: 300-1000ms') 
  console.log('🐌 Needs Work: 1000-2000ms')
  console.log('🚨 Critical: > 2000ms')

  // Test cache effectiveness
  console.log('\n🔄 Testing Cache Effectiveness...')
  const cacheTestUrl = '/api/posts?page=1&limit=5'
  
  // First request (should be MISS)
  const start1 = Date.now()
  const resp1 = await fetch(`${API_BASE}${cacheTestUrl}`)
  const time1 = Date.now() - start1
  const cache1 = resp1.headers.get('X-Cache') || 'UNKNOWN'
  const query1 = resp1.headers.get('X-Query-Time') || 'UNKNOWN'
  
  console.log(`First request: ${time1}ms - Cache: ${cache1} - Query: ${query1}`)
  
  // Wait a moment then make second request (should be HIT)
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const start2 = Date.now()
  const resp2 = await fetch(`${API_BASE}${cacheTestUrl}`)
  const time2 = Date.now() - start2
  const cache2 = resp2.headers.get('X-Cache') || 'UNKNOWN'
  
  console.log(`Second request: ${time2}ms - Cache: ${cache2}`)
  
  const improvement = time1 > 0 ? (((time1 - time2) / time1) * 100).toFixed(1) : 0
  
  if (cache2 === 'HIT' && time2 < time1) {
    console.log(`✅ Cache working! ${improvement}% improvement (${time1}ms → ${time2}ms)`)
  } else {
    console.log('⚠️ Cache may not be working as expected')
  }

  // 🚀 BATCH AGGREGATION EFFECTIVENESS TEST
  console.log('\n🔍 Testing Batch Aggregation Effectiveness...')
  console.log('Looking for batch query timing in server logs...')
  console.log('Expected breakdown:')
  console.log('- Posts fetch: < 200ms')
  console.log('- Batch queries: < 300ms') 
  console.log('- Data processing: < 50ms')
  console.log('- Total: < 600ms for cold cache')

  console.log('\n🏁 Advanced performance test completed!')
  console.log('\n💡 Check server logs for detailed query breakdown:')
  console.log('- Look for: "⚡ Posts fetch:", "⚡ Batch queries:", "⚡ Data processing:"')
  console.log('- Batch optimization success: Individual query times < 300ms each')
}

// Run the test
testAPIPerformance().catch(console.error) 