import { NextResponse } from 'next/server';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || '';
  const directUrl = process.env.DIRECT_URL || '';
  
  // Check if URLs are using the correct endpoints
  const isPooledUrl = databaseUrl.includes('pooler.supabase.com:6543');
  const isDirectUrl = directUrl.includes('db.ivjtrpazmmppjcqdzibm.supabase.co:5432');
  
  return NextResponse.json({
    success: true,
    config: {
      hasPooledUrl: isPooledUrl,
      hasDirectUrl: isDirectUrl,
      // Only show the host part for security
      pooledUrlHost: databaseUrl.split('@')[1]?.split('/')[0] || 'not-set',
      directUrlHost: directUrl.split('@')[1]?.split('/')[0] || 'not-set',
    }
  });
} 