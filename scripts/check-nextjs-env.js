#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking Next.js environment configuration...');

// Check for environment files
const rootDir = path.resolve(__dirname, '..');
const envFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
];

console.log('\n📑 Environment files:');
envFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} exists`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('DATABASE_URL=')) {
        const databaseUrl = content.match(/DATABASE_URL=([^\r\n]+)/)?.[1];
        if (databaseUrl) {
          // Mask the password in the URL for display
          const maskedUrl = databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//\\1:***@');
          console.log(`     Contains DATABASE_URL: ${maskedUrl}`);
          
          // Check if it's using the pooler
          if (databaseUrl.includes('pooler.supabase.com')) {
            console.log('     ✅ Using connection pooler (pooler.supabase.com)');
          } else if (databaseUrl.includes('db.ivjtrpazmmppjcqdzibm.supabase.co')) {
            console.log('     ⚠️ Using direct database connection (db.ivjtrpazmmppjcqdzibm.supabase.co)');
          }
        }
      } else {
        console.log('     ❌ Does not contain DATABASE_URL');
      }
    } catch (error) {
      console.error(`     ❌ Error reading file: ${error.message}`);
    }
  } else {
    console.log(`  ❌ ${file} does not exist`);
  }
});

// Check for Next.js restart needed
console.log('\n📋 Next.js server status:');
try {
  const processExists = execSync("ps aux | grep '[n]ext'").toString();
  console.log('  ✅ Next.js server is running');

  const restartCommand = `
To restart Next.js and apply environment changes:

1. Stop current server (Ctrl+C)
2. Run: npm run dev
`;
  console.log(restartCommand);
} catch (error) {
  console.log('  ❌ Next.js server is not running');
}

console.log('\n📝 Recommendations:');
console.log('1. Make sure DATABASE_URL in .env.local is using the pooler URL');
console.log('2. Restart the Next.js server to pick up environment changes');
console.log('3. Clear browser cache and cookies');
console.log('4. Check Network tab in browser dev tools to ensure no lingering cached responses'); 