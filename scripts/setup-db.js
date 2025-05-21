#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔍 Database Setup Script');
console.log('=======================\n');

// Check if DATABASE_URL is properly set
console.log('1. Checking DATABASE_URL...');
try {
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  const envPath = path.join(__dirname, '..', '.env');
  
  let dbUrl = '';
  
  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf8');
    const match = envLocal.match(/DATABASE_URL=([^\r\n]+)/);
    if (match) dbUrl = match[1];
  }
  
  if (!dbUrl && fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/DATABASE_URL=([^\r\n]+)/);
    if (match) dbUrl = match[1];
  }
  
  if (dbUrl) {
    const url = new URL(dbUrl);
    console.log(`✅ DATABASE_URL found: ${url.hostname}:${url.port}`);
  } else {
    console.error('❌ DATABASE_URL not found in environment files');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error checking DATABASE_URL:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('\n2. Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}

// Run migrations
console.log('\n3. Running database migrations...');
try {
  console.log('Creating database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed successfully');
} catch (error) {
  console.error('❌ Error running migrations:', error.message);
  console.log('\nTrying alternative approach with prisma db push...');
  
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database schema pushed successfully');
  } catch (pushError) {
    console.error('❌ Error pushing schema:', pushError.message);
    process.exit(1);
  }
}

console.log('\n✅ Database setup completed!');
console.log('\nYou can now restart your Next.js server with:');
console.log('npm run dev'); 