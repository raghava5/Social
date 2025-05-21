#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Finding and fixing direct Prisma imports...');

// Path to the project root
const rootDir = path.join(__dirname, '..');

// Search for files importing directly from @prisma/client or using hardcoded db URL
try {
  console.log('Searching for direct Prisma imports...');
  
  // Find files importing from @prisma/client with both quote styles
  const grepResults = execSync('grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -E "from [\'\\"]@prisma/client[\'\\"]" ' + rootDir, { encoding: 'utf8' });
  
  // Find files referencing the direct db URL
  const dbUrlResults = execSync('grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "db.ivjtrpazmmppjcqdzibm.supabase.co" ' + rootDir, { encoding: 'utf8' });
  
  const directImports = grepResults.split('\n').filter(line => line.trim() !== '');
  const dbUrlReferences = dbUrlResults.split('\n').filter(line => line.trim() !== '');
  
  console.log(`\n${directImports.length} files with direct Prisma imports found.`);
  if (directImports.length > 0) {
    console.log('\nProblematic Prisma imports:');
    directImports.forEach(line => console.log(' - ' + line));
  }
  
  console.log(`\n${dbUrlReferences.length} files with hardcoded database URLs found.`);
  if (dbUrlReferences.length > 0) {
    console.log('\nProblematic database URL references:');
    dbUrlReferences.forEach(line => console.log(' - ' + line));
  }

  console.log('\n🛠️  Recommendation:');
  console.log('1. Replace imports from \'@prisma/client\' with:');
  console.log('   import { prisma, type PrismaClient } from \'@/lib/db\';');
  console.log('\n2. Remove any hardcoded database URLs and use environment variables');
  
  console.log('\n📋 Update Plan:');
  console.log('1. Update any problematic files manually');
  console.log('2. Restart your Next.js server: npm run dev');
  console.log('3. Clear your browser cache');
  
} catch (error) {
  console.error('Error while searching for problematic imports:', error.message);
}

// Restart Next.js server
console.log('\n🔄 Would you like to restart your Next.js server now? (y/n)');
console.log('(You need to manually type "y" and press Enter in your terminal)'); 