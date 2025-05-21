#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// New content for the prisma.ts file
const newContent = `import { PrismaClient } from '@prisma/client'

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

try {
  const url = new URL(process.env.DATABASE_URL)
  console.log(\`Prisma connecting to: \${url.hostname}:\${url.port}\`)
  
  // Check if using the correct pooler URL
  if (!url.hostname.includes('pooler.supabase.com')) {
    console.warn('⚠️ Warning: DATABASE_URL does not point to pooler.supabase.com')
  }
} catch (e) {
  console.error('⚠️ Invalid DATABASE_URL format:', e instanceof Error ? e.message : String(e))
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
    errorFormat: 'pretty',
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

export { prisma }
`;

// Path to the prisma.ts file
const filePath = path.join(__dirname, '../lib/prisma.ts');

// Backup the original file
fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath, 'utf8'));
console.log('✅ Backed up original prisma.ts');

// Write the new content
fs.writeFileSync(filePath, newContent);
console.log('✅ Updated prisma.ts with improved error handling');

console.log('Next steps:');
console.log('1. Restart your Next.js server');
console.log('2. Test posting again'); 