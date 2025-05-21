#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Updating .env file for Supabase-Prisma configuration...');

// Path to .env file
const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  process.exit(1);
}

// Read current .env content
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract connection info
const projectRef = 'ivjtrpazmmppjcqdzibm';
const password = '9mEHjDPtMkUYKOz7';

// Generate correct connection URLs based on official docs
const correctDbUrl = `DATABASE_URL=postgres://postgres.${projectRef}:${password}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`;
const correctDirectUrl = `DIRECT_URL=postgres://postgres.${projectRef}:${password}@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&pool_mode=transaction`;

// Create updated content
let updatedContent = envContent;

// Replace DATABASE_URL
updatedContent = updatedContent.replace(
  /DATABASE_URL=["']?.*?["']?$/m, 
  correctDbUrl
);

// Replace DIRECT_URL
updatedContent = updatedContent.replace(
  /DIRECT_URL=["']?.*?["']?$/m, 
  correctDirectUrl
);

// Display the changes
console.log('\nChanges to be made:');
console.log('\nOld DATABASE_URL:');
const oldDbUrl = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
console.log(oldDbUrl ? oldDbUrl[0] : 'Not found');

console.log('\nNew DATABASE_URL:');
console.log(correctDbUrl);

console.log('\nOld DIRECT_URL:');
const oldDirectUrl = envContent.match(/DIRECT_URL=["']?(.*?)["']?$/m);
console.log(oldDirectUrl ? oldDirectUrl[0] : 'Not found');

console.log('\nNew DIRECT_URL:');
console.log(correctDirectUrl);

// Ask for confirmation
rl.question('\nDo you want to apply these changes to your .env file? (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    // Backup the original file
    fs.writeFileSync(`${envPath}.backup`, envContent);
    console.log('✅ Original .env file backed up to .env.backup');
    
    // Write updated content
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ .env file updated successfully!');
    
    console.log('\nNext steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma migrate dev');
  } else {
    console.log('🛑 Operation cancelled. No changes were made.');
    console.log('\nYou can manually update your .env file with:');
    console.log(correctDbUrl);
    console.log(correctDirectUrl);
  }
  
  rl.close();
});

// Path to the .env.local file
const envPathLocal = path.resolve(__dirname, '..', '.env.local');

console.log('🔄 Updating DATABASE_URL in .env.local...');

try {
  // Read the current content
  let envContentLocal = '';
  
  if (fs.existsSync(envPathLocal)) {
    envContentLocal = fs.readFileSync(envPathLocal, 'utf-8');
    console.log('Found existing .env.local file');
  } else {
    console.log('No .env.local file found, creating a new one');
  }

  // Replace or add the DATABASE_URL
  const oldUrlPattern = /DATABASE_URL=.*(\r?\n|$)/;
  const newUrl = 'DATABASE_URL=postgresql://postgres.ivjtrpazmmppjcqdzibm:9mEHjDPtMkUYKOz7@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&sslmode=require\n';
  
  if (oldUrlPattern.test(envContentLocal)) {
    // Replace the existing URL
    envContentLocal = envContentLocal.replace(oldUrlPattern, newUrl);
  } else {
    // Add the new URL
    envContentLocal += newUrl;
  }

  // Write the updated content back to the file
  fs.writeFileSync(envPathLocal, envContentLocal);
  
  console.log('✅ DATABASE_URL updated successfully!');
  console.log('New URL: postgres.ivjtrpazmmppjcqdzibm:***@aws-0-us-east-2.pooler.supabase.com:6543/postgres');
  console.log('\n⚠️ Please restart your Next.js server for changes to take effect');
} catch (error) {
  console.error('❌ Error updating DATABASE_URL:', error);
} 