import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  console.log('Testing PostgreSQL connection...');
  
  // Use environment variables instead of hardcoded credentials
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    return NextResponse.json({
      success: false,
      error: 'DATABASE_URL environment variable is not set',
    }, { status: 500 });
  }
  
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
        // Hide actual connection details for security
        connected: true
      }
    });
  } catch (error: any) {
    console.error('PostgreSQL connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      connectionInfo: {
        connected: false
      }
    }, { 
      status: 500 
    });
  } finally {
    await pool.end();
  }
} 