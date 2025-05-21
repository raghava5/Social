import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  console.log('Testing PostgreSQL connection...');
  
  // Force using the pooled connection
  const connectionString = "postgresql://postgres.ivjtrpazmmppjcqdzibm:9mEHjDPtMkUYKOz7@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting connection with pooled URL...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL connection successful',
      timestamp: result.rows[0].now,
      connectionInfo: {
        host: connectionString.split('@')[1]?.split('/')[0] || 'not-set'
      }
    });
  } catch (error: any) {
    console.error('PostgreSQL connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      connectionInfo: {
        host: connectionString.split('@')[1]?.split('/')[0] || 'not-set'
      }
    }, { 
      status: 500 
    });
  } finally {
    await pool.end();
  }
} 