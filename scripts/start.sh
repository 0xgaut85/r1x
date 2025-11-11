#!/bin/sh
set -e

echo "=========================================="
echo "Starting r1x application..."
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set!"
  echo "Please configure DATABASE_URL in Railway service variables."
  exit 1
fi

echo ""
echo "✓ DATABASE_URL is configured"

# Run database migrations
echo ""
echo "Running database migrations..."
if npx prisma migrate deploy; then
  echo "✓ Database migrations completed successfully"
else
  echo "⚠ Warning: Migration command failed"
  echo "  Attempting to apply Staking table migration directly..."
  
  # Fallback: Create Staking table directly if migration fails
  npx prisma db execute --stdin << 'EOF' || echo "⚠ Could not create Staking table - will be created on first API call"
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
CREATE UNIQUE INDEX IF NOT EXISTS "Staking_userAddress_key" ON "Staking"("userAddress");
CREATE INDEX IF NOT EXISTS "Staking_userAddress_idx" ON "Staking"("userAddress");
CREATE INDEX IF NOT EXISTS "Staking_status_idx" ON "Staking"("status");
EOF
  
  echo "  Continuing with application startup..."
fi

# Note: Database connection is verified by successful migration
# If migrations ran successfully, the database is accessible

# Start the application
echo ""
echo "=========================================="
echo "Starting Next.js server..."
echo "=========================================="
exec node server.js
