import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Try a simple query that doesn't require existing tables
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      result
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      env: {
        hasUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        // Don't log actual URLs for security
        urlLength: process.env.DATABASE_URL?.length || 0,
        directUrlLength: process.env.DIRECT_URL?.length || 0
      }
    }, { status: 500 });
  }
} 