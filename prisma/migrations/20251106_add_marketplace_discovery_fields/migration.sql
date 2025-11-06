-- Add new discovery fields to Service table (safe additive changes)
ALTER TABLE "public"."Service"
  ADD COLUMN IF NOT EXISTS "type" TEXT,
  ADD COLUMN IF NOT EXISTS "method" TEXT,
  ADD COLUMN IF NOT EXISTS "inputSchema" JSONB,
  ADD COLUMN IF NOT EXISTS "outputSchema" JSONB,
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "isExternal" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "screenshotUrl" TEXT;

-- Create indexes for filtering
DO $$ BEGIN
  CREATE INDEX "Service_type_idx" ON "public"."Service"("type");
EXCEPTION WHEN duplicate_table THEN
  -- index exists
  NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "Service_source_idx" ON "public"."Service"("source");
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "Service_isExternal_idx" ON "public"."Service"("isExternal");
EXCEPTION WHEN duplicate_table THEN
  NULL;
END $$;

