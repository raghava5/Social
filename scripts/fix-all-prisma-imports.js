#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Finding and fixing direct Prisma imports...');

// Path to the project root
const rootDir = path.join(__dirname, '..');

// Search for problematic files
function getProblematicFiles() {
  try {
    // Find files with direct imports
    console.log('Finding direct imports from @prisma/client...');
    const directImportResult = execSync(
      'grep -r --include="*.ts" --include="*.tsx" --include="*.js" "from \\(.[\'\\"]\\)@prisma/client\\1" ' + rootDir, 
      { encoding: 'utf8' }
    ).split('\n').filter(Boolean);
    
    // Find files with direct PrismaClient instantiation
    console.log('Finding direct PrismaClient instantiations...');
    const newClientResult = execSync(
      'grep -r --include="*.ts" --include="*.tsx" --include="*.js" "new PrismaClient" ' + rootDir, 
      { encoding: 'utf8' }
    ).split('\n').filter(Boolean);

    // Find hard-coded database URLs
    console.log('Finding hard-coded database URLs...');
    const dbUrlResult = execSync(
      'grep -r --include="*.ts" --include="*.tsx" --include="*.js" "db\\.ivjtrpazmmppjcqdzibm\\.supabase\\.co" ' + rootDir, 
      { encoding: 'utf8' }
    ).split('\n').filter(Boolean);

    return {
      directImports: directImportResult,
      newClient: newClientResult.filter(line => !line.includes('/lib/db.ts') && !line.includes('/lib/prisma.ts')),
      dbUrls: dbUrlResult
    };
  } catch (error) {
    console.error('Error finding problematic files:', error.message);
    return { directImports: [], newClient: [], dbUrls: [] };
  }
}

// Apply fixes to all problematic files automatically
async function fixFiles(files) {
  for (const filePath of files) {
    try {
      const [file] = filePath.split(':');
      if (fs.existsSync(file)) {
        console.log(`Fixing ${file}...`);
        let content = fs.readFileSync(file, 'utf-8');
        
        // Replace imports
        content = content.replace(
          /import\s+{\s*PrismaClient\s*}.*?from\s+(['"])@prisma\/client\1/g,
          "import { prisma } from '@/lib/db'"
        );
        
        // Replace new PrismaClient instances
        content = content.replace(
          /const\s+prisma\s+=\s+new\s+PrismaClient\([^)]*\)/g,
          "// Using centralized prisma client\n// const prisma = ... (removed)\n// Use import { prisma } from '@/lib/db' instead"
        );
        
        // Remove prisma.$disconnect() calls
        content = content.replace(/await\s+prisma\.\$disconnect\(\);?/g, '// prisma.$disconnect() call removed');
        
        // Save the file
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed ${file}`);
      }
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error.message);
    }
  }
}

async function showSummary(filesInfo) {
  const { directImports, newClient, dbUrls } = filesInfo;
  
  console.log('\n📊 Summary:');
  console.log(`Found ${directImports.length} files with direct imports from @prisma/client`);
  console.log(`Found ${newClient.length} files with direct instantiation of PrismaClient`);
  console.log(`Found ${dbUrls.length} files with hard-coded database URLs`);

  if (directImports.length > 0) {
    console.log('\n🛠️ Direct imports from @prisma/client:');
    directImports.forEach(file => console.log(`  - ${file}`));
  }

  if (newClient.length > 0) {
    console.log('\n🛠️ Direct instantiations of PrismaClient:');
    newClient.forEach(file => console.log(`  - ${file}`));
  }

  if (dbUrls.length > 0) {
    console.log('\n🛠️ Hard-coded database URLs:');
    dbUrls.forEach(file => console.log(`  - ${file}`));
  }

  console.log('\n📋 Recommendation:');
  console.log('1. Replace imports from @prisma/client with:');
  console.log('   import { prisma } from \'@/lib/db\';');
  
  console.log('\n2. Remove direct PrismaClient instantiations and use the shared client');
  
  console.log('\n3. Remove any hardcoded database URLs and use environment variables');
  
  console.log('\nTo fix the issues automatically, run:');
  console.log('node scripts/fix-all-prisma-imports.js --fix');
}

async function main() {
  const files = getProblematicFiles();
  const shouldFix = process.argv.includes('--fix');
  
  if (shouldFix) {
    console.log('\n🔄 Fixing problematic files...');
    await fixFiles([...files.directImports, ...files.newClient]);
    console.log('\n✅ Fixes applied!');
  } else {
    await showSummary(files);
  }
  
  console.log('\n🔄 To restart your Next.js server after making changes:');
  console.log('npm run dev');
}

main().catch(console.error); 