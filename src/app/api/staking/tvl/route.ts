import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Get total TVL (Total Value Locked) - sum of all staked amounts
 * GET /api/staking/tvl
 */
export async function GET(request: NextRequest) {
  try {
    // Get all active staking records
    const allStaking = await prisma.staking.findMany({
      where: {
        status: {
          in: ['staked', 'unstaking'], // Only count active staking
        },
      },
    });

    // Calculate total TVL
    const totalTvl = allStaking.reduce((sum, staking) => {
      return sum + parseFloat(staking.stakedAmount || '0');
    }, 0);

    return NextResponse.json({
      tvl: totalTvl.toFixed(6),
      stakerCount: allStaking.length,
    });
  } catch (error: any) {
    console.error('[TVL GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get TVL' },
      { status: 500 }
    );
  }
}

