import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const STAKING_ADDRESS = 'HdjRVLjPNpkayysqTsKo1oYBHwzLHAVmgp6uLVH4Sk4Q';
const UNSTAKE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Initiate unstake request
 * POST /api/staking/unstake/initiate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      );
    }

    // Find or create staking record
    let staking = await prisma.staking.findUnique({
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
    staking = await prisma.staking.update({
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
  } catch (error: any) {
    console.error('[Unstake Initiate] Error:', error);
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
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      );
    }

    const staking = await prisma.staking.findUnique({
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
  } catch (error: any) {
    console.error('[Unstake Status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get unstake status' },
      { status: 500 }
    );
  }
}

