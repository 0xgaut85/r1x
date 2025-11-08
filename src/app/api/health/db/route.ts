/**
 * Database Health Check API Route
 * 
 * Verifies database connection and schema status
 * Useful for Railway deployment verification
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Check if tables exist by querying migration table
    const tablesQuery = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const tables = tablesQuery.map(t => t.tablename);
    
    // Verify expected tables exist
    const expectedTables = ['Service', 'Transaction', 'Fee', '_prisma_migrations'];
    const missingTables = expectedTables.filter(
      table => !tables.some(t => t.toLowerCase() === table.toLowerCase())
    );
    
    // Test basic queries
    const serviceCount = await prisma.service.count();
    const transactionCount = await prisma.transaction.count();
    const feeCount = await prisma.fee.count();
    
    // Check for pending migrations
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: any }>>`
      SELECT migration_name, finished_at 
      FROM "_prisma_migrations" 
      ORDER BY finished_at DESC 
      LIMIT 5;
    `;
    
    const pendingMigrations = migrations.filter(m => !m.finished_at);
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        tables: {
          found: tables.length,
          expected: expectedTables.length,
          missing: missingTables,
          allPresent: missingTables.length === 0,
        },
        data: {
          services: serviceCount,
          transactions: transactionCount,
          fees: feeCount,
        },
        migrations: {
          recent: migrations.length,
          pending: pendingMigrations.length,
          lastMigration: migrations[0]?.migration_name || null,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          connected: false,
          error: error.message || 'Unknown error',
          code: error.code || 'UNKNOWN',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

