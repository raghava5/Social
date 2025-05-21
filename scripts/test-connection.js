#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🔍 Testing Prisma connection to Supabase...');
  
  try {
    // Try a simple raw query first
    console.log('Attempting raw query...');
    const result = await prisma.$queryRaw`SELECT NOW() as time, current_database() as db`;
    console.log(`✅ Raw query successful: ${new Date(result[0].time).toISOString()}`);
    console.log(`✅ Connected to database: ${result[0].db}`);
    
    // Count existing users (if any)
    console.log('Counting users...');
    const userCount = await prisma.user.count();
    console.log(`✅ User count query successful: ${userCount} users found`);
    
    console.log('⭐ All tests passed! Your Prisma-Supabase connection is working properly.');
    return { success: true };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(result => {
    if (!result.success) {
      console.error(result.error);
      process.exit(1);
    }
  })
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  }); 