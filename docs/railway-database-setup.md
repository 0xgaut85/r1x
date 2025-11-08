# Railway Database Setup Guide - r1x-db

## Overview

This guide ensures your PostgreSQL database (`r1x-db`) is correctly configured on Railway and all migrations are applied.

## Prerequisites

- Railway account and project created
- PostgreSQL database service created on Railway
- Next.js service deployed on Railway

## Step 1: Create PostgreSQL Database on Railway

1. Go to your Railway project dashboard
2. Click **"New Service"**
3. Select **"Database"** → **"PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL database
   - Generate a `DATABASE_URL` connection string
   - Add it to your project's environment variables

**Important:** Railway creates the database URL automatically. You don't need to manually configure it.

## Step 2: Verify DATABASE_URL Environment Variable

### Option A: Via Railway Dashboard

1. Go to Railway → Your Project → **PostgreSQL Service**
2. Click on **"Variables"** tab
3. Verify `DATABASE_URL` exists and is populated
4. It should look like: `postgresql://postgres:password@hostname:port/railway`

### Option B: Via Next.js Service

1. Go to Railway → Your Project → **Next.js Service**
2. Click on **"Variables"** tab
3. Verify `DATABASE_URL` is present (Railway should automatically share it)
4. If missing, click **"New Variable"** and reference the PostgreSQL service's `DATABASE_URL`

**Note:** Railway automatically shares database connection strings between services in the same project.

## Step 3: Run Database Migrations

Database migrations run automatically on startup via the `scripts/start.sh` script. However, you can also run them manually:

### Option A: Automatic (Recommended)

Migrations run automatically when the Next.js service starts:
- The `scripts/start.sh` script runs `npx prisma migrate deploy` before starting the server
- Check deployment logs to verify migrations completed successfully

### Option B: Manual via Railway CLI

```bash
# Install Railway CLI if needed
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

### Option C: Manual via Railway Dashboard

1. Go to Railway → Your Project → **Next.js Service**
2. Click **"Deployments"** → Select latest deployment
3. Click **"View Logs"**
4. Click **"Shell"** button
5. Run: `npx prisma migrate deploy`

## Step 4: Verify Database Connection

### Health Check Endpoint

After deployment, verify the database is working:

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
      "found": 4,
      "expected": 4,
      "missing": [],
      "allPresent": true
    },
    "data": {
      "services": 0,
      "transactions": 0,
      "fees": 0
    },
    "migrations": {
      "recent": 1,
      "pending": 0,
      "lastMigration": "20250103000000_init"
    }
  },
  "timestamp": "2025-01-XX..."
}
```

### Using Prisma Studio (Optional)

For visual database inspection:

```bash
# Via Railway CLI
railway run npx prisma studio

# Then access at http://localhost:5555
# Note: You'll need to port-forward if using Railway CLI
```

## Step 5: Initial Data Sync

After database is set up, sync PayAI services:

```bash
curl -X POST https://your-app.up.railway.app/api/sync/payai
```

Or with authentication (if `SYNC_SECRET` is set):

```bash
curl -X POST https://your-app.up.railway.app/api/sync/payai \
  -H "Authorization: Bearer YOUR_SYNC_SECRET"
```

## Troubleshooting

### Migration Errors

**Error: "Migration failed or already applied"**

This is normal if migrations already ran. Check logs for the actual error. If migrations are missing:

```bash
railway run npx prisma migrate deploy
```

**Error: "Can't reach database server"**

1. Verify `DATABASE_URL` is set in Next.js service variables
2. Check PostgreSQL service is running (green status)
3. Verify network connectivity (Railway services should auto-connect)

### Connection Pool Errors

If you see connection pool errors, the database URL might be incorrect:

1. Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
2. Verify database service is running
3. Check Railway logs for connection errors

### Tables Missing

If health check shows missing tables:

1. Run migrations manually: `railway run npx prisma migrate deploy`
2. Check migration logs for errors
3. Verify Prisma schema matches database state

## Verification Checklist

- [ ] PostgreSQL database service created on Railway
- [ ] `DATABASE_URL` environment variable present in Next.js service
- [ ] Database migrations ran successfully (check deployment logs)
- [ ] Health check endpoint returns `"status": "healthy"`
- [ ] All expected tables exist (`Service`, `Transaction`, `Fee`)
- [ ] PayAI sync endpoint works (optional, requires other env vars)

## Schema Information

The database contains three main tables:

1. **Service** - PayAI services synced from facilitator
2. **Transaction** - Payment transactions and their status
3. **Fee** - Platform fee records and transfer status

See `prisma/schema.prisma` for full schema definition.

## Next Steps

After database is verified:

1. Configure other environment variables (see `docs/railway-env-vars.md`)
2. Sync PayAI services: `POST /api/sync/payai`
3. Test marketplace: `GET /api/marketplace/services`
4. Monitor database usage in Railway dashboard

## Support

- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs
- Check deployment logs in Railway dashboard for detailed error messages

