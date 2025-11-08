#!/bin/sh
set -e

echo "=========================================="
echo "Starting x402-server..."
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
cd "$(dirname "$0")/.." || exit 1
if npx prisma migrate deploy --schema prisma/schema.prisma; then
  echo "✓ Database migrations completed successfully"
else
  echo "⚠ Warning: Migration command failed or migrations already applied"
  echo "  This is usually fine if migrations were already run."
  echo "  Continuing with application startup..."
fi

# Start the application
echo ""
echo "=========================================="
echo "Starting x402-server..."
echo "=========================================="
exec npm start

