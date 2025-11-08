# Verify Railway Database Configuration - Quick Guide

## Run Verification Script

```bash
# Make sure you're in the project root
cd /path/to/x402robotics

# Run verification script
./scripts/verify-db-config.sh
```

Or if DATABASE_URL is set:
```bash
DATABASE_URL="your-connection-string" ./scripts/verify-db-config.sh
```

## Manual Verification Checklist

### ✅ Local Configuration Files

- [x] `railway.json` - Uses `sh scripts/start.sh` as start command
- [x] `Dockerfile` - Copies scripts directory and makes start.sh executable
- [x] `nixpacks.toml` - Uses start script in start phase
- [x] `scripts/start.sh` - Runs migrations automatically
- [x] `prisma/schema.prisma` - Configured correctly
- [x] `prisma/migrations/` - Migration files exist
- [x] `src/app/api/health/db/route.ts` - Health check endpoint exists

### ✅ Railway Dashboard Checks

1. **PostgreSQL Database Service**
   - [ ] Service exists and is running (green status)
   - [ ] Service name: `r1x-db` or similar
   - [ ] Variables tab shows `DATABASE_URL` with value

2. **Next.js Service**
   - [ ] Service exists and is deployed
   - [ ] Variables tab includes `DATABASE_URL` (should auto-share from PostgreSQL service)
   - [ ] If missing, add `DATABASE_URL` referencing PostgreSQL service

3. **Deployment Logs**
   - [ ] Check latest deployment logs
   - [ ] Should see: "✓ DATABASE_URL is configured"
   - [ ] Should see: "✓ Database migrations completed successfully"
   - [ ] No database connection errors

### ✅ Verify Database Health

After deployment, test the health endpoint:

```bash
curl https://your-app.up.railway.app/api/health/db
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "tables": {
      "allPresent": true
    },
    "migrations": {
      "pending": 0
    }
  }
}
```

## Railway CLI Verification

If you have Railway CLI installed:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Check environment variables
railway variables

# Run migrations manually (if needed)
railway run npx prisma migrate deploy

# Test database connection
railway run npx prisma db execute --stdin <<< "SELECT 1;"
```

## Common Issues & Fixes

### Issue: DATABASE_URL not found in Next.js service

**Fix:**
1. Go to Railway → PostgreSQL Service → Variables
2. Copy the `DATABASE_URL` value
3. Go to Railway → Next.js Service → Variables
4. Click "New Variable"
5. Name: `DATABASE_URL`
6. Value: Paste the connection string
7. Or use Railway's "Reference Variable" feature to link services

### Issue: Migrations don't run

**Fix:**
1. Check `railway.json` has correct start command
2. Verify `scripts/start.sh` exists and is executable
3. Check deployment logs for errors
4. Run manually: `railway run npx prisma migrate deploy`

### Issue: Health check returns "unhealthy"

**Fix:**
1. Verify PostgreSQL service is running
2. Check `DATABASE_URL` format is correct
3. Verify network connectivity (services should auto-connect)
4. Check application logs for database errors

## Next Steps After Verification

1. ✅ All checks pass → Deploy to Railway
2. ✅ Migrations run automatically → Check health endpoint
3. ✅ Health endpoint returns "healthy" → Sync PayAI services
4. ✅ Database operational → Test application features

## Support

- Railway Docs: https://docs.railway.app/databases/postgresql
- Prisma Docs: https://www.prisma.io/docs
- Check Railway deployment logs for detailed errors

