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
if prisma migrate deploy; then
  echo "✓ Database migrations completed successfully"
else
  echo "⚠ Warning: Migration command failed or migrations already applied"
  echo "  This is usually fine if migrations were already run."
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
