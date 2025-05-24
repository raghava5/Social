#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing .env file for Supabase-Prisma configuration...');

// Path to .env file
const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  process.exit(1);
}

// Read current .env content
const envContent = fs.readFileSync(envPath, 'utf8');

// SECURITY UPDATE: Removed hardcoded credentials
console.log('\n✅ According to Supabase docs, your connection strings should be:');
console.log('\n1. For DATABASE_URL (session mode, port 5432):');
console.log('DATABASE_URL=postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres');
console.log('\n2. For DIRECT_URL (transaction mode, port 6543):');
console.log('DIRECT_URL=postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_HOST]:6543/postgres?pgbouncer=true&pool_mode=transaction');

console.log('\nPlease manually update your .env file with these values.');
console.log('\nNote: Use port 5432 for DATABASE_URL and 6543 for DIRECT_URL.');

// Print the current URLs for comparison (without showing credentials)
console.log('\nYour current configuration:');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
const directUrlMatch = envContent.match(/DIRECT_URL=["']?(.*?)["']?$/m);

if (dbUrlMatch) {
  console.log(`DATABASE_URL: [CREDENTIALS HIDDEN]`);
}

if (directUrlMatch) {
  console.log(`DIRECT_URL: [CREDENTIALS HIDDEN]`);
}

console.log('\n🔍 Note: The main issues in your current setup:');
console.log('1. Database_URL should use port 5432 (not 6543)');
console.log('2. DIRECT_URL should use port 6543 (not 5432)');
console.log('3. Both URLs should use the correct host');

console.log('\nAfter updating your .env file, run:');
console.log('npx prisma generate');
console.log('npx prisma migrate dev'); 