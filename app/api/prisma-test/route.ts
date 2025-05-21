import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  console.log('Testing Prisma connection...');
  
  try {
    // Try a raw query first
    console.log('Attempting raw query...');
    const result = await prisma.$queryRaw`SELECT NOW()`;
    
    // Then try to create a test user
    console.log('Attempting to create test user...');
    const user = await prisma.user.create({
      data: {
        username: `test_user_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        passwordHash: 'test_hash',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Prisma connection and operations successful',
      timestamp: result,
      user: user
    });
  } catch (error: any) {
    console.error('Prisma test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.constructor.name,
      code: error.code
    }, { 
      status: 500 
    });
  }
} 