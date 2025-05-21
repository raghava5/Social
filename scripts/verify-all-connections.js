#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const { PrismaClient } = require('@prisma/client');

console.log('🔍 Comprehensive Database Connection Test');
console.log('========================================');

// Read .env file to get DATABASE_URL
const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);

if (!dbUrlMatch) {
  console.error('❌ Could not find DATABASE_URL in .env file');
  process.exit(1);
}

const connectionString = dbUrlMatch[1];

// Parse the URL to display the host and port
try {
  const url = new URL(connectionString);
  console.log(`\n1. Environment Check`);
  console.log(`   URL verified: ${url.protocol}//${url.hostname}:${url.port}${url.pathname}`);
  console.log(`   Username: ${url.username}`);
  console.log(`   SSL Mode: ${url.searchParams.get('sslmode') || 'Not specified'}`);
} catch (error) {
  console.error('❌ Invalid DATABASE_URL:', error.message);
  process.exit(1);
}

// Test with postgres package
console.log(`\n2. Testing with postgres package`);
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 5,
  idle_timeout: 10,
  connect_timeout: 10,
  prepare: false,
});

async function testPostgres() {
  try {
    console.log('   Executing query...');
    const result = await sql`SELECT NOW() as time, current_database() as db, current_user as user`;
    console.log('   ✅ Connection successful!');
    console.log(`   Timestamp: ${new Date(result[0].time).toISOString()}`);
    console.log(`   Database: ${result[0].db}`);
    console.log(`   Connected as user: ${result[0].user}`);
    
    // Try counting users
    const usersResult = await sql`SELECT COUNT(*) as count FROM "User"`;
    console.log(`   ✅ Found ${usersResult[0].count} users in the database`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ postgres package connection error:`, error.message);
    return false;
  } finally {
    await sql.end();
    console.log('   Connection closed');
  }
}

// Test with Prisma
console.log(`\n3. Testing with Prisma Client`);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString
    }
  },
  log: ['error', 'warn']
});

async function testPrisma() {
  try {
    console.log('   Executing query...');
    const result = await prisma.$queryRaw`SELECT NOW() as time`;
    console.log('   ✅ Raw query successful!');
    console.log(`   Timestamp: ${new Date(result[0].time).toISOString()}`);
    
    // Try counting users
    console.log('   Counting users with Prisma...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Found ${userCount} users in the database`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Prisma connection error:`, error.message);
    return false;
  } finally {
    await prisma.$disconnect();
    console.log('   Connection closed');
  }
}

// Run tests
(async () => {
  console.log('Running tests...');
  
  const postgresResult = await testPostgres();
  const prismaResult = await testPrisma();
  
  console.log('\n4. Summary');
  console.log(`   postgres package: ${postgresResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`   Prisma Client: ${prismaResult ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (postgresResult && prismaResult) {
    console.log('\n✅ ALL TESTS PASSED! Your database connection is working properly.');
  } else {
    console.log('\n❌ TESTS FAILED. Please check your DATABASE_URL and configuration.');
    
    if (postgresResult && !prismaResult) {
      console.log('\nThe postgres package works but Prisma doesn\'t. This suggests:');
      console.log('1. The Prisma schema might be incompatible with your database');
      console.log('2. The DATABASE_URL might be cached in your application');
      console.log('3. You might need to restart your Next.js server');
    }
    
    process.exit(1);
  }
})().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 