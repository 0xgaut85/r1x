import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';

/**
 * Get staking data for a user
 * GET /api/staking?userAddress=...
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
    let staking:
      | {
          id: string;
          userAddress: string;
          stakedAmount: string;
          status: string;
          createdAt: Date | null;
          unstakeRequestedAt: Date | null;
          unstakeCompletedAt: Date | null;
        }
      | null = null;

    // @ts-ignore - model may not exist on some generated clients
    if ((prisma as any).staking?.findUnique) {
      // @ts-ignore
      staking = await (prisma as any).staking.findUnique({
        where: { userAddress },
      });
    } else {
      // Raw SQL fallback
      const rows = (await prisma.$queryRaw`
        SELECT
          "id",
          "userAddress",
          "stakedAmount",
          "status",
          "createdAt",
          "unstakeRequestedAt",
          "unstakeCompletedAt"
        FROM "Staking"
        WHERE "userAddress" = ${userAddress}
        LIMIT 1
      `) as Array<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        status: string;
        createdAt: Date | null;
        unstakeRequestedAt: Date | null;
        unstakeCompletedAt: Date | null;
      }>;
      staking = rows?.[0] ?? null;
    }

    if (!staking) {
      return NextResponse.json({
        stakedAmount: '0',
        status: 'not_staked',
        createdAt: null,
      });
    }

    return NextResponse.json({
      stakedAmount: staking.stakedAmount,
      status: staking.status,
      createdAt: staking.createdAt,
      unstakeRequestedAt: staking.unstakeRequestedAt,
      unstakeCompletedAt: staking.unstakeCompletedAt,
    });
  } catch (error: any) {
    console.error('[Staking GET] Error:', error);
    console.error('[Staking GET] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Check if it's a migration/database schema issue - create table if missing
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[Staking GET] Staking table does not exist, attempting to create it...');
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
        console.log('[Staking GET] Staking table created successfully, retrying query...');
        // Retry the query
        const rows = (await prisma.$queryRaw`
          SELECT
            "id", "userAddress", "stakedAmount", "status", "createdAt", "unstakeRequestedAt", "unstakeCompletedAt"
          FROM "Staking"
          WHERE "userAddress" = ${userAddress}
          LIMIT 1
        `) as Array<{
          id: string;
          userAddress: string;
          stakedAmount: string;
          status: string;
          createdAt: Date | null;
          unstakeRequestedAt: Date | null;
          unstakeCompletedAt: Date | null;
        }>;
        const staking = rows?.[0] ?? null;
        if (!staking) {
          return NextResponse.json({
            stakedAmount: '0',
            status: 'not_staked',
            createdAt: null,
          });
        }
        return NextResponse.json({
          stakedAmount: staking.stakedAmount,
          status: staking.status,
          createdAt: staking.createdAt,
          unstakeRequestedAt: staking.unstakeRequestedAt,
          unstakeCompletedAt: staking.unstakeCompletedAt,
        });
      } catch (createError: any) {
        console.error('[Staking GET] Failed to create Staking table:', createError);
        return NextResponse.json(
          { error: 'Database migration required. The Staking table may not exist yet.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to get staking data' },
      { status: 500 }
    );
  }
}

/**
 * Create or update staking data
 * POST /api/staking
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userAddress, stakedAmount } = body;

  if (!userAddress) {
    return NextResponse.json(
      { error: 'userAddress is required' },
      { status: 400 }
    );
  }

  if (!stakedAmount || parseFloat(stakedAmount) < 0) {
    return NextResponse.json(
      { error: 'stakedAmount is required and must be >= 0' },
      { status: 400 }
    );
  }

  const normalizedAmount = stakedAmount.toString();
  const newStatus = parseFloat(stakedAmount) > 0 ? 'staked' : 'unstaked';

  try {

    // Prefer Prisma Model when available; fall back to raw SQL when not
    // @ts-ignore - model may not exist on some generated clients
    if ((prisma as any).staking?.findUnique) {
      // @ts-ignore
      const existing = await (prisma as any).staking.findUnique({
        where: { userAddress },
      });

      let staking;
      if (existing) {
        // @ts-ignore
        staking = await (prisma as any).staking.update({
          where: { userAddress },
          data: {
            stakedAmount: normalizedAmount,
            status: newStatus,
            ...(parseFloat(stakedAmount) === 0 && existing.status === 'unstaking'
              ? { unstakeCompletedAt: new Date() }
              : {}),
          },
        });
      } else {
        // @ts-ignore
        staking = await (prisma as any).staking.create({
          data: {
            userAddress,
            stakedAmount: normalizedAmount,
            status: newStatus,
          },
        });
      }

      return NextResponse.json({
        success: true,
        stakedAmount: staking.stakedAmount,
        status: staking.status,
        createdAt: staking.createdAt,
      });
    } else {
      // Raw SQL UPSERT fallback
      const id = randomUUID();
      const rows = (await prisma.$queryRaw`
        INSERT INTO "Staking" (
          "id", "userAddress", "stakedAmount", "status", "createdAt", "updatedAt"
        )
        VALUES (
          ${id}, ${userAddress}, ${normalizedAmount}, ${newStatus}, NOW(), NOW()
        )
        ON CONFLICT ("userAddress")
        DO UPDATE SET
          "stakedAmount" = EXCLUDED."stakedAmount",
          "status" = EXCLUDED."status",
          "updatedAt" = NOW()
        RETURNING
          "id",
          "userAddress",
          "stakedAmount",
          "status",
          "createdAt"
      `) as Array<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        status: string;
        createdAt: Date;
      }>;

      const staking = rows?.[0];
      if (!staking) {
        return NextResponse.json(
          { error: 'Failed to save staking data (no rows returned)' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        stakedAmount: staking.stakedAmount,
        status: staking.status,
        createdAt: staking.createdAt,
      });
    }
  } catch (error: any) {
    console.error('[Staking POST] Error:', error);
    console.error('[Staking POST] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Check if it's a migration/database schema issue - create table if missing
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[Staking POST] Staking table does not exist, attempting to create it...');
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
        console.log('[Staking POST] Staking table created successfully, retrying save...');
        // Retry the save
        const id = randomUUID();
        const rows = (await prisma.$queryRaw`
          INSERT INTO "Staking" (
            "id", "userAddress", "stakedAmount", "status", "createdAt", "updatedAt"
          )
          VALUES (
            ${id}, ${userAddress}, ${normalizedAmount}, ${newStatus}, NOW(), NOW()
          )
          ON CONFLICT ("userAddress")
          DO UPDATE SET
            "stakedAmount" = EXCLUDED."stakedAmount",
            "status" = EXCLUDED."status",
            "updatedAt" = NOW()
          RETURNING
            "id", "userAddress", "stakedAmount", "status", "createdAt"
        `) as Array<{
          id: string;
          userAddress: string;
          stakedAmount: string;
          status: string;
          createdAt: Date;
        }>;
        const staking = rows?.[0];
        if (!staking) {
          return NextResponse.json(
            { error: 'Failed to save staking data (no rows returned)' },
            { status: 500 }
          );
        }
        return NextResponse.json({
          success: true,
          stakedAmount: staking.stakedAmount,
          status: staking.status,
          createdAt: staking.createdAt,
        });
      } catch (createError: any) {
        console.error('[Staking POST] Failed to create Staking table:', createError);
        return NextResponse.json(
          { error: 'Database migration required. The Staking table may not exist yet.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to save staking data' },
      { status: 500 }
    );
  }
}

