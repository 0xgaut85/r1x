import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Get staking data for a user
 * GET /api/staking?userAddress=...
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure prisma is initialized
    if (!prisma) {
      console.error('[Staking GET] Prisma Client is not initialized');
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    // Ensure staking model is available
    if (!prisma.staking) {
      console.error('[Staking GET] Prisma Client staking model not available. Prisma Client may need to be regenerated.');
      return NextResponse.json(
        { error: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

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
    // Ensure prisma is initialized
    if (!prisma) {
      console.error('[Staking POST] Prisma Client is not initialized');
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    // Ensure staking model is available
    if (!prisma.staking) {
      console.error('[Staking POST] Prisma Client staking model not available. Prisma Client may need to be regenerated.');
      return NextResponse.json(
        { error: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

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

    // Find existing staking record
    const existing = await prisma.staking.findUnique({
      where: { userAddress },
    });

    let staking;
    if (existing) {
      // Update existing record - preserve createdAt timestamp
      staking = await prisma.staking.update({
        where: { userAddress },
        data: {
          stakedAmount: stakedAmount.toString(),
          status: parseFloat(stakedAmount) > 0 ? 'staked' : 'unstaked',
          // Only update unstake fields if unstaking
          ...(parseFloat(stakedAmount) === 0 && existing.status === 'unstaking' ? {
            unstakeCompletedAt: new Date(),
          } : {}),
        },
      });
    } else {
      // Create new record
      staking = await prisma.staking.create({
        data: {
          userAddress,
          stakedAmount: stakedAmount.toString(),
          status: parseFloat(stakedAmount) > 0 ? 'staked' : 'unstaked',
        },
      });
    }

    return NextResponse.json({
      success: true,
      stakedAmount: staking.stakedAmount,
      status: staking.status,
      createdAt: staking.createdAt,
    });
  } catch (error: any) {
    console.error('[Staking POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save staking data' },
      { status: 500 }
    );
  }
}

