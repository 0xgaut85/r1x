-- CreateTable
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
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Staking_userAddress_key" ON "Staking"("userAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Staking_userAddress_idx" ON "Staking"("userAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Staking_status_idx" ON "Staking"("status");

