-- Add self-serve listing fields to Service table (idempotent)
DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "ownerAddress" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT DEFAULT 'approved';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "x402Ready" BOOLEAN NOT NULL DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "lastPreflightAt" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "lastPreflightStatus" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "facilitatorUrl" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "tokenAddress" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."Service" ADD COLUMN IF NOT EXISTS "payTo" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

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


