import postgres from 'postgres'

// Validate DATABASE_URL before initialization
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

// Log connection information for debugging
try {
  const url = new URL(process.env.DATABASE_URL)
  console.log(`Postgres connecting to: ${url.hostname}:${url.port}`)
  
  // Verify we're using the pooler URL
  if (!url.hostname.includes('pooler.supabase.com')) {
    console.warn('⚠️ Warning: DATABASE_URL should use pooler.supabase.com')
  }
} catch (e) {
  console.error('Invalid DATABASE_URL:', e instanceof Error ? e.message : String(e))
}

// Test connection immediately in development
if (process.env.NODE_ENV === 'development') {
  console.log('Testing Postgres connection...')
}

// Create postgres client with optimal configuration
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20, 
  connect_timeout: 10,
  prepare: false, // Required for pgBouncer
  types: {
    // Add custom type handlers if needed
  },
  connection: {
    application_name: 'social_app',
  },
  onnotice: (notice) => {
    console.log('Database Notice:', notice)
  },
  debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
})

// Test connection immediately in development
if (process.env.NODE_ENV === 'development') {
  sql`SELECT 1`.then(() => {
    console.log('✅ Postgres connection test successful')
  }).catch(err => {
    console.error('❌ Postgres connection test failed:', err)
  })
}

export default sql 