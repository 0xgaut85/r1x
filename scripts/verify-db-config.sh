#!/bin/sh
# Database Configuration Verification Script
# Run this to verify your Railway database configuration

echo "=========================================="
echo "r1x Database Configuration Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: DATABASE_URL environment variable
echo "1. Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "${RED}✗ DATABASE_URL is not set${NC}"
  echo "   → Configure DATABASE_URL in Railway service variables"
  ERRORS=$((ERRORS + 1))
else
  echo "${GREEN}✓ DATABASE_URL is set${NC}"
  # Check format
  if echo "$DATABASE_URL" | grep -q "^postgresql://"; then
    echo "${GREEN}✓ DATABASE_URL format is correct${NC}"
  else
    echo "${YELLOW}⚠ DATABASE_URL format may be incorrect (should start with postgresql://)${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
fi
echo ""

# Check 2: Prisma schema exists
echo "2. Checking Prisma schema..."
if [ -f "prisma/schema.prisma" ]; then
  echo "${GREEN}✓ prisma/schema.prisma exists${NC}"
  
  # Check if DATABASE_URL is referenced
  if grep -q "DATABASE_URL" prisma/schema.prisma; then
    echo "${GREEN}✓ Schema references DATABASE_URL${NC}"
  else
    echo "${RED}✗ Schema does not reference DATABASE_URL${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "${RED}✗ prisma/schema.prisma not found${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: Migration files exist
echo "3. Checking migration files..."
if [ -d "prisma/migrations" ]; then
  MIGRATION_COUNT=$(find prisma/migrations -name "*.sql" | wc -l)
  if [ "$MIGRATION_COUNT" -gt 0 ]; then
    echo "${GREEN}✓ Found $MIGRATION_COUNT migration file(s)${NC}"
  else
    echo "${YELLOW}⚠ No migration files found${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "${YELLOW}⚠ prisma/migrations directory not found${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 4: Start script exists and is executable
echo "4. Checking start script..."
if [ -f "scripts/start.sh" ]; then
  echo "${GREEN}✓ scripts/start.sh exists${NC}"
  
  if [ -x "scripts/start.sh" ]; then
    echo "${GREEN}✓ scripts/start.sh is executable${NC}"
  else
    echo "${YELLOW}⚠ scripts/start.sh is not executable${NC}"
    echo "   → Run: chmod +x scripts/start.sh"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  # Check if script runs migrations
  if grep -q "prisma migrate deploy" scripts/start.sh; then
    echo "${GREEN}✓ Start script includes migration command${NC}"
  else
    echo "${RED}✗ Start script does not include migration command${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "${RED}✗ scripts/start.sh not found${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 5: Railway configuration
echo "5. Checking Railway configuration..."
if [ -f "railway.json" ]; then
  echo "${GREEN}✓ railway.json exists${NC}"
  
  if grep -q "start.sh" railway.json; then
    echo "${GREEN}✓ railway.json references start script${NC}"
  else
    echo "${YELLOW}⚠ railway.json may not reference start script${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "${YELLOW}⚠ railway.json not found (optional)${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 6: Dockerfile configuration
echo "6. Checking Dockerfile..."
if [ -f "Dockerfile" ]; then
  echo "${GREEN}✓ Dockerfile exists${NC}"
  
  if grep -q "scripts/start.sh" Dockerfile; then
    echo "${GREEN}✓ Dockerfile references start script${NC}"
  else
    echo "${YELLOW}⚠ Dockerfile may not reference start script${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  if grep -q "chmod.*start.sh" Dockerfile; then
    echo "${GREEN}✓ Dockerfile makes start script executable${NC}"
  else
    echo "${YELLOW}⚠ Dockerfile may not make start script executable${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "${YELLOW}⚠ Dockerfile not found (using nixpacks)${NC}"
fi
echo ""

# Check 7: Health check endpoint
echo "7. Checking health check endpoint..."
if [ -f "src/app/api/health/db/route.ts" ]; then
  echo "${GREEN}✓ Database health check endpoint exists${NC}"
else
  echo "${YELLOW}⚠ Database health check endpoint not found${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 8: Database connection test (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "8. Testing database connection..."
  if command -v npx >/dev/null 2>&1; then
    if npx prisma db execute --stdin <<EOF 2>/dev/null; then
SELECT 1;
EOF
      echo "${GREEN}✓ Database connection successful${NC}"
    else
      echo "${YELLOW}⚠ Could not connect to database${NC}"
      echo "   → This may be normal if Prisma client hasn't been generated"
      echo "   → Or if database is not accessible from this environment"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo "${YELLOW}⚠ npx not available, skipping connection test${NC}"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "8. Skipping database connection test (DATABASE_URL not set)"
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "${GREEN}✓ All checks passed! Configuration looks good.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Ensure PostgreSQL database service exists on Railway"
  echo "2. Verify DATABASE_URL is set in Railway service variables"
  echo "3. Deploy to Railway - migrations will run automatically"
  echo "4. Test health endpoint: GET /api/health/db"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "${YELLOW}⚠ Configuration has $WARNINGS warning(s) but no errors${NC}"
  echo ""
  echo "Configuration should work, but review warnings above."
  exit 0
else
  echo "${RED}✗ Configuration has $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  echo ""
  echo "Please fix the errors above before deploying."
  exit 1
fi

