import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Get total TVL (Total Value Locked) - sum of all staked amounts
 * GET /api/staking/tvl
 */
export async function GET(request: NextRequest) {
  try {
    // Prefer Prisma Model when available; fall back to raw SQL when not
    // @ts-ignore - model may not exist on some generated clients
    if ((prisma as any).staking?.findMany) {
      // @ts-ignore
      const allStaking = await (prisma as any).staking.findMany({
        where: {
          status: {
            in: ['staked', 'unstaking'], // Only count active staking
          },
        },
      });

      // Calculate total TVL
      const totalTvl = allStaking.reduce((sum: number, staking: any) => {
        return sum + parseFloat(staking.stakedAmount || '0');
      }, 0);

      return NextResponse.json({
        tvl: totalTvl.toFixed(6),
        stakerCount: allStaking.length,
      });
    } else {
      // Raw SQL fallback
      const rows = (await prisma.$queryRaw`
        SELECT
          "stakedAmount", "status"
        FROM "Staking"
        WHERE "status" IN ('staked', 'unstaking')
      `) as Array<{
        stakedAmount: string;
        status: string;
      }>;

      // Calculate total TVL
      const totalTvl = rows.reduce((sum, staking) => {
        return sum + parseFloat(staking.stakedAmount || '0');
      }, 0);

      return NextResponse.json({
        tvl: totalTvl.toFixed(6),
        stakerCount: rows.length,
      });
    }
  } catch (error: any) {
    console.error('[TVL GET] Error:', error);
    
    // Check if it's a migration/database schema issue - create table if missing
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[TVL GET] Staking table does not exist, attempting to create it...');
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Staking" (
            "id" TEXT NOT NULL,
            "userAddress" TEXT NOT NULL,
            "stakedAmount" TEXT NOT NULL,
            "unstakeRequestedAt" TIMESTAMP(3),
            "unstakeCompletedAt" TIMESTAMP(3),
            "status" TEXT NOT NULL DEFAULT 'staked',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Staking_pkey" PRIMARY KEY ("id")
          )
        `;
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Staking_userAddress_key" ON "Staking"("userAddress")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Staking_userAddress_idx" ON "Staking"("userAddress")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Staking_status_idx" ON "Staking"("status")`;
        console.log('[TVL GET] Staking table created successfully, returning zero TVL...');
        return NextResponse.json({
          tvl: '0',
          stakerCount: 0,
        });
      } catch (createError: any) {
        console.error('[TVL GET] Failed to create Staking table:', createError);
        return NextResponse.json({
          tvl: '0',
          stakerCount: 0,
          error: 'Database migration required',
        });
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to get TVL' },
      { status: 500 }
    );
  }
}

