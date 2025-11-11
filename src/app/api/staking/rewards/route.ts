import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CAMPAIGN_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const TOTAL_REWARDS_USDC = '15000'; // 15k USDC
const CLAIM_LOCK_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get rewards campaign info and user's rewards
 * GET /api/staking/rewards?userAddress=...
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
    // Get or create active campaign
    let campaign: {
      id: string;
      startTime: Date;
      endTime: Date;
      totalRewards: string;
      isActive: boolean;
    } | null = null;

    // Try Prisma model first
    // @ts-ignore
    if ((prisma as any).rewardsCampaign?.findFirst) {
      // @ts-ignore
      campaign = await (prisma as any).rewardsCampaign.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Raw SQL fallback
      const rows = (await prisma.$queryRaw`
        SELECT "id", "startTime", "endTime", "totalRewards", "isActive"
        FROM "RewardsCampaign"
        WHERE "isActive" = true
        ORDER BY "createdAt" DESC
        LIMIT 1
      `) as Array<{
        id: string;
        startTime: Date;
        endTime: Date;
        totalRewards: string;
        isActive: boolean;
      }>;
      campaign = rows?.[0] ?? null;
    }

    // Create campaign if none exists or current one has ended
    const now = new Date();
    if (!campaign || new Date(campaign.endTime) < now) {
      // Deactivate old campaigns
      if (campaign) {
        // @ts-ignore
        if ((prisma as any).rewardsCampaign?.updateMany) {
          // @ts-ignore
          await (prisma as any).rewardsCampaign.updateMany({
            where: { isActive: true },
            data: { isActive: false },
          });
        } else {
          await prisma.$executeRaw`
            UPDATE "RewardsCampaign" SET "isActive" = false WHERE "isActive" = true
          `;
        }
      }

      // Create new campaign
      const startTime = now;
      const endTime = new Date(startTime.getTime() + CAMPAIGN_DURATION_MS);
      const campaignId = crypto.randomUUID();

      // @ts-ignore
      if ((prisma as any).rewardsCampaign?.create) {
        // @ts-ignore
        campaign = await (prisma as any).rewardsCampaign.create({
          data: {
            id: campaignId,
            startTime,
            endTime,
            totalRewards: TOTAL_REWARDS_USDC,
            isActive: true,
          },
        });
      } else {
        await prisma.$executeRaw`
          INSERT INTO "RewardsCampaign" (
            "id", "startTime", "endTime", "totalRewards", "isActive", "createdAt", "updatedAt"
          )
          VALUES (
            ${campaignId}, ${startTime}, ${endTime}, ${TOTAL_REWARDS_USDC}, true, NOW(), NOW()
          )
        `;
        campaign = {
          id: campaignId,
          startTime,
          endTime,
          totalRewards: TOTAL_REWARDS_USDC,
          isActive: true,
        };
      }
    }

    // Get user's staked amount
    let stakedAmount = '0';
    // @ts-ignore
    if ((prisma as any).staking?.findUnique) {
      // @ts-ignore
      const staking = await (prisma as any).staking.findUnique({
        where: { userAddress },
      });
      stakedAmount = staking?.stakedAmount || '0';
    } else {
      const rows = (await prisma.$queryRaw`
        SELECT "stakedAmount" FROM "Staking"
        WHERE "userAddress" = ${userAddress} AND "status" IN ('staked', 'unstaking')
        LIMIT 1
      `) as Array<{ stakedAmount: string }>;
      stakedAmount = rows?.[0]?.stakedAmount || '0';
    }

    // Get total staked amount (for pro-rata calculation)
    let totalStaked = '0';
    // @ts-ignore
    if ((prisma as any).staking?.findMany) {
      // @ts-ignore
      const allStaking = await (prisma as any).staking.findMany({
        where: { status: { in: ['staked', 'unstaking'] } },
      });
      totalStaked = allStaking
        .reduce((sum: number, s: any) => sum + parseFloat(s.stakedAmount || '0'), 0)
        .toString();
    } else {
      const rows = (await prisma.$queryRaw`
        SELECT SUM(CAST("stakedAmount" AS DECIMAL)) as total
        FROM "Staking"
        WHERE "status" IN ('staked', 'unstaking')
      `) as Array<{ total: string | null }>;
      totalStaked = rows?.[0]?.total || '0';
    }

    // Calculate claimable amount (pro-rata based on staked amount)
    const userStaked = parseFloat(stakedAmount);
    const totalStakedNum = parseFloat(totalStaked) || 1; // Avoid division by zero
    const userShare = totalStakedNum > 0 ? userStaked / totalStakedNum : 0;

    // Calculate how much has been distributed so far (linear over 12 hours)
    const campaignStart = new Date(campaign.startTime).getTime();
    const campaignEnd = new Date(campaign.endTime).getTime();
    const elapsed = Math.max(0, Math.min(now.getTime() - campaignStart, campaignEnd - campaignStart));
    const progress = campaignEnd > campaignStart ? elapsed / (campaignEnd - campaignStart) : 0;
    const distributedRewards = parseFloat(campaign.totalRewards) * progress;
    const userClaimable = distributedRewards * userShare;

    // Get user's reward record
    let userReward: {
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
        SELECT "claimableAmount", "claimedAmount", "claimRequestedAt", "status"
        FROM "StakingReward"
        WHERE "campaignId" = ${campaign.id} AND "userAddress" = ${userAddress}
        LIMIT 1
      `) as Array<{
        claimableAmount: string;
        claimedAmount: string;
        claimRequestedAt: Date | null;
        status: string;
      }>;
      userReward = rows?.[0] ?? null;
    }

    // Update or create user reward record
    const claimableAmountStr = userClaimable.toFixed(6);
    if (!userReward) {
      const rewardId = crypto.randomUUID();
      // @ts-ignore
      if ((prisma as any).stakingReward?.create) {
        // @ts-ignore
        await (prisma as any).stakingReward.create({
          data: {
            id: rewardId,
            campaignId: campaign.id,
            userAddress,
            claimableAmount: claimableAmountStr,
            claimedAmount: '0',
            status: 'pending',
          },
        });
      } else {
        await prisma.$executeRaw`
          INSERT INTO "StakingReward" (
            "id", "campaignId", "userAddress", "claimableAmount", "claimedAmount", "status", "createdAt", "updatedAt"
          )
          VALUES (
            ${rewardId}, ${campaign.id}, ${userAddress}, ${claimableAmountStr}, '0', 'pending', NOW(), NOW()
          )
        `;
      }
    } else {
      // Update claimable amount
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
          data: { claimableAmount: claimableAmountStr },
        });
      } else {
        await prisma.$executeRaw`
          UPDATE "StakingReward"
          SET "claimableAmount" = ${claimableAmountStr}, "updatedAt" = NOW()
          WHERE "campaignId" = ${campaign.id} AND "userAddress" = ${userAddress}
        `;
      }
    }

    // Check claim lock status
    const claimRequestedAt = userReward?.claimRequestedAt;
    let canClaim = true;
    let claimLockRemainingMs = 0;
    if (claimRequestedAt) {
      const timeElapsed = now.getTime() - new Date(claimRequestedAt).getTime();
      if (timeElapsed < CLAIM_LOCK_MS) {
        canClaim = false;
        claimLockRemainingMs = CLAIM_LOCK_MS - timeElapsed;
      }
    }

    // Calculate boosted APY
    // Base APY is 27%, boosted APY adds rewards APY
    const baseApy = 27.0;
    const annualRewards = parseFloat(campaign.totalRewards) * (365 / (CAMPAIGN_DURATION_MS / (1000 * 60 * 60 * 24)));
    const rewardsApy = totalStakedNum > 0 ? (annualRewards / totalStakedNum) * 100 : 0;
    const boostedApy = baseApy + rewardsApy;

    return NextResponse.json({
      campaign: {
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        totalRewards: campaign.totalRewards,
        progress: progress * 100, // Percentage
      },
      userReward: {
        claimableAmount: claimableAmountStr,
        claimedAmount: userReward?.claimedAmount || '0',
        canClaim,
        claimLockRemainingMs,
        status: userReward?.status || 'pending',
      },
      apy: {
        base: baseApy,
        boosted: boostedApy,
        rewardsBoost: rewardsApy,
      },
    });
  } catch (error: any) {
    console.error('[Rewards GET] Error:', error);
    
    // Check if tables don't exist - create them
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[Rewards GET] Tables do not exist, attempting to create them...');
      try {
        // Create RewardsCampaign table
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

        // Create StakingReward table
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
        
        console.log('[Rewards GET] Tables created successfully, retrying...');
        // Retry the request
        return GET(request);
      } catch (createError: any) {
        console.error('[Rewards GET] Failed to create tables:', createError);
        return NextResponse.json(
          { error: 'Database migration required. The rewards tables may not exist yet.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to get rewards' },
      { status: 500 }
    );
  }
}

