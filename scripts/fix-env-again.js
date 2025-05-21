#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 Fixing .env file one more time...');

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

// Generate correct connection URLs based on diagnosed issue
// Use the pooler URL for both connections
const correctDbUrl = `DATABASE_URL=postgres://postgres.${projectRef}:${password}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`;
const correctDirectUrl = `DIRECT_URL=postgres://postgres.${projectRef}:${password}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`;

// Create updated content
let updatedContent = envContent;

// Replace DATABASE_URL
updatedContent = updatedContent.replace(
  /DATABASE_URL=["']?.*?["']?$/m, 
  correctDbUrl
);

// Replace DIRECT_URL (if it exists)
if (updatedContent.match(/DIRECT_URL=["']?.*?["']?$/m)) {
  updatedContent = updatedContent.replace(
    /DIRECT_URL=["']?.*?["']?$/m, 
    correctDirectUrl
  );
}

// Display the changes
console.log('\nChanges to be made:');
console.log('\nOld DATABASE_URL:');
const oldDbUrl = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
console.log(oldDbUrl ? oldDbUrl[0] : 'Not found');

console.log('\nNew DATABASE_URL:');
console.log(correctDbUrl);

// Ask for confirmation
rl.question('\nDo you want to apply these changes to your .env file? (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    // Backup the original file
    fs.writeFileSync(`${envPath}.backup2`, envContent);
    console.log('✅ Original .env file backed up to .env.backup2');
    
    // Write updated content
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ .env file updated successfully!');
    
    console.log('\nNext steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma db push');
  } else {
    console.log('🛑 Operation cancelled. No changes were made.');
  }
  
  rl.close();
}); 