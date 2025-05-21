import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try to create a test user to verify table creation
    const user = await prisma.user.create({
      data: {
        username: 'test_user',
        email: 'test@example.com',
        passwordHash: 'test_hash',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database setup successful',
      user
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    
    // Check if tables exist
    try {
      await prisma.$queryRaw`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'User'
      );`;
    } catch (schemaError: any) {
      console.error('Schema check error:', schemaError);
    }

    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.constructor.name,
      code: error.code
    }, { status: 500 });
  }
} 