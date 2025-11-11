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
MIGRATION_OUTPUT=$(npx prisma migrate deploy 2>&1)
MIGRATION_EXIT=$?

if [ $MIGRATION_EXIT -eq 0 ]; then
  echo "✓ Database migrations completed successfully"
else
  echo "⚠ Warning: Migration command failed (exit code: $MIGRATION_EXIT)"
  echo "Migration output: $MIGRATION_OUTPUT"
  
  # Fallback: Use db push to sync schema (creates missing tables)
  echo ""
  echo "Attempting to sync database schema with db push..."
  if npx prisma db push --skip-generate --accept-data-loss 2>&1; then
    echo "✓ Database schema synced successfully"
  else
    echo "⚠ Schema sync failed, but continuing startup..."
    echo "  API routes will attempt to create missing tables on first use"
  fi
  
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
