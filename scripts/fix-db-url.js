#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Path to the .env.local file
const envPath = path.resolve(__dirname, '..', '.env.local');

console.log('🔄 Updating DATABASE_URL in .env.local...');

try {
  // Read the current content
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    console.log('Found existing .env.local file');
  } else {
    console.log('No .env.local file found, creating a new one');
  }

  // Replace or add the DATABASE_URL
  const oldUrlPattern = /DATABASE_URL=.*(\r?\n|$)/;
  const newUrl = 'DATABASE_URL=postgresql://postgres.ivjtrpazmmppjcqdzibm:9mEHjDPtMkUYKOz7@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&sslmode=require\n';
  
  if (oldUrlPattern.test(envContent)) {
    // Replace the existing URL
    envContent = envContent.replace(oldUrlPattern, newUrl);
  } else {
    // Add the new URL
    envContent += newUrl;
  }

  // Write the updated content back to the file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ DATABASE_URL updated successfully!');
  console.log('New URL: postgres.ivjtrpazmmppjcqdzibm:***@aws-0-us-east-2.pooler.supabase.com:6543/postgres');
  console.log('\n⚠️ Please restart your Next.js server for changes to take effect');
} catch (error) {
  console.error('❌ Error updating DATABASE_URL:', error);
} 