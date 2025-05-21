#!/usr/bin/env node
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing postgres package connection...');

// Read .env file to get DATABASE_URL
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);

if (!dbUrlMatch) {
  console.error('❌ Could not find DATABASE_URL in .env file');
  process.exit(1);
}

const connectionString = dbUrlMatch[1];
console.log(`Connection string found (showing host only): ${new URL(connectionString).host}`);

// Create SQL client
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  debug: console.log,
  onnotice: (notice) => {
    console.log('Database Notice:', notice);
  },
  onconnect: async () => {
    console.log('Connected to database successfully');
  },
});

async function main() {
  try {
    console.log('Executing test query...');
    const result = await sql`SELECT NOW(), current_database(), current_user`;
    
    console.log('\n✅ Connection successful!');
    console.log(`Timestamp: ${new Date(result[0].now).toISOString()}`);
    console.log(`Database: ${result[0].current_database}`);
    console.log(`User: ${result[0].current_user}`);
    
    return { success: true };
  } catch (error) {
    console.error('\n❌ Connection failed:', error);
    return { success: false, error };
  } finally {
    await sql.end();
    console.log('Connection closed');
  }
}

main()
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 