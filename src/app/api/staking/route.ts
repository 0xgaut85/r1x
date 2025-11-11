import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';

/**
 * Get staking data for a user
 * GET /api/staking?userAddress=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      );
    }

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
    
    // Check if it's a migration/database schema issue
    if (error.message?.includes('Unknown model') || error.message?.includes('does not exist') || error.code === 'P2001') {
      return NextResponse.json(
        { error: 'Database migration required. The Staking table may not exist yet.' },
        { status: 500 }
      );
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
  try {
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
    
    // Check if it's a migration/database schema issue
    if (error.message?.includes('Unknown model') || error.message?.includes('does not exist') || error.code === 'P2001') {
      return NextResponse.json(
        { error: 'Database migration required. The Staking table may not exist yet.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to save staking data' },
      { status: 500 }
    );
  }
}

