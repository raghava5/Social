import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Try a simple query that doesn't require specific tables
    const { data, error } = await supabase
      .rpc('get_current_timestamp')
      .select();

    if (error) {
      // If RPC fails, try a raw query
      const { data: rawData, error: rawError } = await supabase
        .from('_sqlx_migrations')  // This is a system table that should exist
        .select('*')
        .limit(1);

      if (rawError) throw rawError;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data,
      connectionInfo: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        pooledUrl: process.env.DATABASE_URL?.includes('pooler.supabase.com:6543')
      }
    });
  } catch (error: any) {
    console.error('Supabase test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      connectionInfo: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        pooledUrl: process.env.DATABASE_URL?.includes('pooler.supabase.com:6543')
      }
    }, { 
      status: 500 
    });
  }
} 