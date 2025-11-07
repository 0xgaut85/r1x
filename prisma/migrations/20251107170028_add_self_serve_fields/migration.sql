-- Add self-serve listing fields to Service table
ALTER TABLE "public"."Service"
  ADD COLUMN IF NOT EXISTS "ownerAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "x402Ready" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "lastPreflightAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastPreflightStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "facilitatorUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "tokenAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "payTo" TEXT;

-- Create indexes for new fields (idempotent)
DO $$ BEGIN
  CREATE INDEX "Service_ownerAddress_idx" ON "public"."Service"("ownerAddress");
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "Service_approvalStatus_idx" ON "public"."Service"("approvalStatus");
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "Service_x402Ready_idx" ON "public"."Service"("x402Ready");
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;


