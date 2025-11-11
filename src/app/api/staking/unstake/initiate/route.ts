import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const STAKING_ADDRESS = 'HdjRVLjPNpkayysqTsKo1oYBHwzLHAVmgp6uLVH4Sk4Q';
const UNSTAKE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Initiate unstake request
 * POST /api/staking/unstake/initiate
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userAddress } = body;

  if (!userAddress) {
    return NextResponse.json(
      { error: 'userAddress is required' },
      { status: 400 }
    );
  }

  try {
    // Prefer Prisma Model when available; fall back to raw SQL when not
    // @ts-ignore - model may not exist on some generated clients
    if ((prisma as any).staking?.findUnique) {
      // @ts-ignore
      let staking = await (prisma as any).staking.findUnique({
        where: { userAddress },
      });

      if (!staking) {
        return NextResponse.json(
          { error: 'No staking record found for this address' },
          { status: 404 }
        );
      }

      if (staking.status === 'unstaking') {
        // Check if cooldown has passed
        if (staking.unstakeRequestedAt) {
          const timeElapsed = Date.now() - staking.unstakeRequestedAt.getTime();
          if (timeElapsed < UNSTAKE_COOLDOWN_MS) {
            const remainingMs = UNSTAKE_COOLDOWN_MS - timeElapsed;
            return NextResponse.json({
              error: 'Unstake cooldown in progress',
              remainingMs,
              canUnstake: false,
            });
          }
        }
      }

      // Initiate unstake
      // @ts-ignore
      staking = await (prisma as any).staking.update({
        where: { userAddress },
        data: {
          status: 'unstaking',
          unstakeRequestedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        unstakeRequestedAt: staking.unstakeRequestedAt,
        cooldownMs: UNSTAKE_COOLDOWN_MS,
      });
    } else {
      // Raw SQL fallback
      const rows = (await prisma.$queryRaw`
        SELECT
          "id", "userAddress", "stakedAmount", "status", "unstakeRequestedAt"
        FROM "Staking"
        WHERE "userAddress" = ${userAddress}
        LIMIT 1
      `) as Array<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        status: string;
        unstakeRequestedAt: Date | null;
      }>;

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'No staking record found for this address' },
          { status: 404 }
        );
      }

      const staking = rows[0];

      if (staking.status === 'unstaking' && staking.unstakeRequestedAt) {
        const timeElapsed = Date.now() - staking.unstakeRequestedAt.getTime();
        if (timeElapsed < UNSTAKE_COOLDOWN_MS) {
          const remainingMs = UNSTAKE_COOLDOWN_MS - timeElapsed;
          return NextResponse.json({
            error: 'Unstake cooldown in progress',
            remainingMs,
            canUnstake: false,
          });
        }
      }

      // Update to initiate unstake
      const updateRows = (await prisma.$queryRaw`
        UPDATE "Staking"
        SET
          "status" = 'unstaking',
          "unstakeRequestedAt" = NOW(),
          "updatedAt" = NOW()
        WHERE "userAddress" = ${userAddress}
        RETURNING "unstakeRequestedAt"
      `) as Array<{
        unstakeRequestedAt: Date;
      }>;

      return NextResponse.json({
        success: true,
        unstakeRequestedAt: updateRows[0].unstakeRequestedAt,
        cooldownMs: UNSTAKE_COOLDOWN_MS,
      });
    }
  } catch (error: any) {
    console.error('[Unstake Initiate] Error:', error);
    
    // Check if it's a migration/database schema issue - create table if missing
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[Unstake Initiate] Staking table does not exist, attempting to create it...');
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
        console.log('[Unstake Initiate] Staking table created, but no staking record found');
        return NextResponse.json(
          { error: 'No staking record found for this address' },
          { status: 404 }
        );
      } catch (createError: any) {
        console.error('[Unstake Initiate] Failed to create Staking table:', createError);
        return NextResponse.json(
          { error: 'Database migration required. The Staking table may not exist yet.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to initiate unstake' },
      { status: 500 }
    );
  }
}

/**
 * Get unstake status
 * GET /api/staking/unstake/status?userAddress=...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get('userAddress');

  if (!userAddress) {
    return NextResponse.json(
      { error: 'userAddress is required' },
      { status: 400 }
    );
  }

  try {
    // Prefer Prisma Model when available; fall back to raw SQL when not
    // @ts-ignore - model may not exist on some generated clients
    if ((prisma as any).staking?.findUnique) {
      // @ts-ignore
      const staking = await (prisma as any).staking.findUnique({
        where: { userAddress },
      });

      if (!staking) {
        return NextResponse.json({
          status: 'not_staked',
          canUnstake: false,
        });
      }

      if (staking.status === 'unstaking' && staking.unstakeRequestedAt) {
        const timeElapsed = Date.now() - staking.unstakeRequestedAt.getTime();
        const remainingMs = Math.max(0, UNSTAKE_COOLDOWN_MS - timeElapsed);
        const canUnstake = remainingMs === 0;

        return NextResponse.json({
          status: staking.status,
          unstakeRequestedAt: staking.unstakeRequestedAt,
          remainingMs,
          canUnstake,
          stakedAmount: staking.stakedAmount,
        });
      }

      return NextResponse.json({
        status: staking.status,
        canUnstake: staking.status === 'staked',
        stakedAmount: staking.stakedAmount,
      });
    } else {
      // Raw SQL fallback
      const rows = (await prisma.$queryRaw`
        SELECT
          "id", "userAddress", "stakedAmount", "status", "unstakeRequestedAt"
        FROM "Staking"
        WHERE "userAddress" = ${userAddress}
        LIMIT 1
      `) as Array<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        status: string;
        unstakeRequestedAt: Date | null;
      }>;

      if (rows.length === 0) {
        return NextResponse.json({
          status: 'not_staked',
          canUnstake: false,
        });
      }

      const staking = rows[0];

      if (staking.status === 'unstaking' && staking.unstakeRequestedAt) {
        const timeElapsed = Date.now() - staking.unstakeRequestedAt.getTime();
        const remainingMs = Math.max(0, UNSTAKE_COOLDOWN_MS - timeElapsed);
        const canUnstake = remainingMs === 0;

        return NextResponse.json({
          status: staking.status,
          unstakeRequestedAt: staking.unstakeRequestedAt,
          remainingMs,
          canUnstake,
          stakedAmount: staking.stakedAmount,
        });
      }

      return NextResponse.json({
        status: staking.status,
        canUnstake: staking.status === 'staked',
        stakedAmount: staking.stakedAmount,
      });
    }
  } catch (error: any) {
    console.error('[Unstake Status] Error:', error);
    
    // Check if it's a migration/database schema issue - create table if missing
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[Unstake Status] Staking table does not exist, attempting to create it...');
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
        console.log('[Unstake Status] Staking table created, returning not_staked status');
        return NextResponse.json({
          status: 'not_staked',
          canUnstake: false,
        });
      } catch (createError: any) {
        console.error('[Unstake Status] Failed to create Staking table:', createError);
        return NextResponse.json({
          status: 'not_staked',
          canUnstake: false,
        });
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to get unstake status' },
      { status: 500 }
    );
  }
}

