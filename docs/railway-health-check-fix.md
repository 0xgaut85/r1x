# Railway Deployment Fix - Health Check Issue

## Problem
Deployment logs show Next.js server starting successfully but Railway health check is stuck at "Starting Container".

## Root Cause
1. **Port Mismatch**: Dockerfile hardcoded `PORT=3000` but Railway sets `PORT=8080` dynamically
2. **Missing Health Check**: Railway needs an explicit health check endpoint to verify the service is ready

## Fixes Applied

### 1. Fixed Dockerfile Port Configuration
- ✅ Removed hardcoded `ENV PORT=3000` (Railway sets this dynamically)
- ✅ Changed `EXPOSE 8080` (Railway's default port)
- ✅ Kept `HOSTNAME="0.0.0.0"` (required for Railway)

### 2. Added Health Check Endpoint
- ✅ Created `/api/health` endpoint (`src/app/api/health/route.ts`)
- ✅ Returns simple JSON: `{ status: 'ok', service: 'r1x-nextjs', timestamp: ... }`

### 3. Configured Railway Health Check
- ✅ Added `healthcheckPath: "/api/health"` to `railway.json`
- ✅ Set `healthcheckTimeout: 100` (100 seconds)

## Files Changed

1. **`Dockerfile`**
   - Removed `ENV PORT=3000`
   - Changed `EXPOSE 8080`

2. **`src/app/api/health/route.ts`** (NEW)
   - Simple health check endpoint

3. **`railway.json`**
   - Added `healthcheckPath` and `healthcheckTimeout`

## Next Steps

1. **Commit and push these changes**
2. **Railway will automatically redeploy**
3. **Check deployment logs** - should see:
   ```
   ✓ Ready in 67ms
   [Health check] GET /api/health → 200 OK
   ```
4. **Verify health check**:
   ```bash
   curl https://your-app.up.railway.app/api/health
   ```

## Why This Fixes It

- **Port Issue**: Next.js was starting on Railway's PORT (8080) but Dockerfile said 3000, causing confusion
- **Health Check**: Railway needs to verify the service is responding before marking it as "ready"
- **Root Path**: Railway checks root `/` by default, but explicit health check path is more reliable

## Alternative Health Check Paths

If `/api/health` doesn't work, Railway will also check:
- `/` (root page - should work since you have `src/app/page.tsx`)
- `/api/health/db` (database health check - more comprehensive)

The `/api/health` endpoint is the simplest and fastest for Railway's health checks.

