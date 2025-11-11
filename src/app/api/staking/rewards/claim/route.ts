import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CLAIM_LOCK_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Claim USDC rewards
 * POST /api/staking/rewards/claim
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
    // Get active campaign
    let campaign: {
      id: string;
      endTime: Date;
    } | null = null;

    // @ts-ignore
    if ((prisma as any).rewardsCampaign?.findFirst) {
      // @ts-ignore
      campaign = await (prisma as any).rewardsCampaign.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      const rows = (await prisma.$queryRaw`
        SELECT "id", "endTime"
        FROM "RewardsCampaign"
        WHERE "isActive" = true
        ORDER BY "createdAt" DESC
        LIMIT 1
      `) as Array<{
        id: string;
        endTime: Date;
      }>;
      campaign = rows?.[0] ?? null;
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'No active rewards campaign found' },
        { status: 404 }
      );
    }

    // Get user's reward record
    let userReward: {
      id: string;
      claimableAmount: string;
      claimedAmount: string;
      claimRequestedAt: Date | null;
      status: string;
    } | null = null;

    // @ts-ignore
    if ((prisma as any).stakingReward?.findUnique) {
      // @ts-ignore
      userReward = await (prisma as any).stakingReward.findUnique({
        where: {
          campaignId_userAddress: {
            campaignId: campaign.id,
            userAddress,
          },
        },
      });
    } else {
      const rows = (await prisma.$queryRaw`
        SELECT "id", "claimableAmount", "claimedAmount", "claimRequestedAt", "status"
        FROM "StakingReward"
        WHERE "campaignId" = ${campaign.id} AND "userAddress" = ${userAddress}
        LIMIT 1
      `) as Array<{
        id: string;
        claimableAmount: string;
        claimedAmount: string;
        claimRequestedAt: Date | null;
        status: string;
      }>;
      userReward = rows?.[0] ?? null;
    }

    if (!userReward) {
      return NextResponse.json(
        { error: 'No reward record found for this address' },
        { status: 404 }
      );
    }

    // Check if already claimed
    if (userReward.status === 'claimed') {
      return NextResponse.json(
        { error: 'Rewards already claimed' },
        { status: 400 }
      );
    }

    // Check claim lock
    const now = new Date();
    if (userReward.claimRequestedAt) {
      const timeElapsed = now.getTime() - new Date(userReward.claimRequestedAt).getTime();
      if (timeElapsed < CLAIM_LOCK_MS) {
        const remainingMs = CLAIM_LOCK_MS - timeElapsed;
        return NextResponse.json({
          error: 'Claim cooldown in progress',
          remainingMs,
          canClaim: false,
        });
      }
    }

    // Calculate claimable amount (accumulated so far)
    const claimableAmount = parseFloat(userReward.claimableAmount);
    const alreadyClaimed = parseFloat(userReward.claimedAmount);
    const toClaim = claimableAmount - alreadyClaimed;

    if (toClaim <= 0) {
      return NextResponse.json(
        { error: 'No rewards available to claim' },
        { status: 400 }
      );
    }

    // Initiate claim (set status to claiming and lock for 24h)
    // @ts-ignore
    if ((prisma as any).stakingReward?.update) {
      // @ts-ignore
      await (prisma as any).stakingReward.update({
        where: {
          campaignId_userAddress: {
            campaignId: campaign.id,
            userAddress,
          },
        },
        data: {
          status: 'claiming',
          claimRequestedAt: now,
        },
      });
    } else {
      await prisma.$executeRaw`
        UPDATE "StakingReward"
        SET
          "status" = 'claiming',
          "claimRequestedAt" = ${now},
          "updatedAt" = NOW()
        WHERE "campaignId" = ${campaign.id} AND "userAddress" = ${userAddress}
      `;
    }

    // TODO: In production, here you would:
    // 1. Transfer USDC tokens to user's wallet
    // 2. Update claimedAmount after successful transfer
    // 3. Set status to 'claimed' and claimCompletedAt

    // For now, we'll simulate the claim
    // In production, replace this with actual USDC transfer
    const newClaimedAmount = (alreadyClaimed + toClaim).toFixed(6);
    
    // @ts-ignore
    if ((prisma as any).stakingReward?.update) {
      // @ts-ignore
      await (prisma as any).stakingReward.update({
        where: {
          campaignId_userAddress: {
            campaignId: campaign.id,
            userAddress,
          },
        },
        data: {
          status: 'claimed',
          claimedAmount: newClaimedAmount,
          claimCompletedAt: now,
        },
      });
    } else {
      await prisma.$executeRaw`
        UPDATE "StakingReward"
        SET
          "status" = 'claimed',
          "claimedAmount" = ${newClaimedAmount},
          "claimCompletedAt" = ${now},
          "updatedAt" = NOW()
        WHERE "campaignId" = ${campaign.id} AND "userAddress" = ${userAddress}
      `;
    }

    return NextResponse.json({
      success: true,
      claimedAmount: toClaim.toFixed(6),
      totalClaimed: newClaimedAmount,
      claimCompletedAt: now,
      // Note: In production, include transaction hash here
    });
  } catch (error: any) {
    console.error('[Rewards Claim] Error:', error);
    
    // Check if tables don't exist
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[Rewards Claim] Tables do not exist, attempting to create them...');
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "RewardsCampaign" (
            "id" TEXT NOT NULL,
            "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "endTime" TIMESTAMP(3) NOT NULL,
            "totalRewards" TEXT NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "RewardsCampaign_pkey" PRIMARY KEY ("id")
          )
        `;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "RewardsCampaign_isActive_idx" ON "RewardsCampaign"("isActive")`;

        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "StakingReward" (
            "id" TEXT NOT NULL,
            "campaignId" TEXT NOT NULL,
            "userAddress" TEXT NOT NULL,
            "claimableAmount" TEXT NOT NULL,
            "claimedAmount" TEXT NOT NULL DEFAULT '0',
            "claimRequestedAt" TIMESTAMP(3),
            "claimCompletedAt" TIMESTAMP(3),
            "status" TEXT NOT NULL DEFAULT 'pending',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "StakingReward_pkey" PRIMARY KEY ("id")
          )
        `;
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "StakingReward_campaignId_userAddress_key" ON "StakingReward"("campaignId", "userAddress")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StakingReward_userAddress_idx" ON "StakingReward"("userAddress")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "StakingReward_status_idx" ON "StakingReward"("status")`;
        
        return NextResponse.json(
          { error: 'No active rewards campaign found. Please try again.' },
          { status: 404 }
        );
      } catch (createError: any) {
        console.error('[Rewards Claim] Failed to create tables:', createError);
        return NextResponse.json(
          { error: 'Database migration required. The rewards tables may not exist yet.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to claim rewards' },
      { status: 500 }
    );
  }
}

