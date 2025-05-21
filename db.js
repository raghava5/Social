import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

// Log the connection host (but not the full URL for security)
const connectionUrl = process.env.DATABASE_URL
const connectionHost = new URL(connectionUrl).host
console.log('Attempting to connect to database host:', connectionHost)

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10, // Max number of connections
  idle_timeout: 20, // Max seconds a connection can be idle
  connect_timeout: 10, // Max seconds to wait for connection
  prepare: false, // Disable prepared statements for pgBouncer compatibility
  types: {
    // Add any custom type parsers if needed
  },
  connection: {
    application_name: 'social_app', // Identifier in pg_stat_activity
  },
  onnotice: (notice) => {
    console.log('Database Notice:', notice)
  },
  onconnect: async () => {
    console.log('Connected to database successfully')
  },
  debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
})

// Test the connection on initialization only in development
if (process.env.NODE_ENV === 'development') {
  sql`SELECT 1`.then(() => {
    console.log('Database connection test successful')
  }).catch(err => {
    console.error('Database connection test failed:', err)
  })
}

export default sql 