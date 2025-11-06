# Database Migration Fix Summary

## Problem
The Prisma schema includes new fields (`type`, `method`, `inputSchema`, `outputSchema`, `source`, `isExternal`, `websiteUrl`, `screenshotUrl`) that don't exist in the database yet. Prisma was trying to SELECT all fields from the schema, causing errors:

```
The column `Service.type` does not exist in the current database.
```

## Solution
Updated all Prisma queries to gracefully handle missing columns by:

1. **Wrapping queries in try-catch** - Catch `P2022` errors (column doesn't exist)
2. **Using `select` in fallback queries** - Explicitly select only existing fields when migration not applied
3. **Removing filters on new columns** - Skip type/source filters if columns don't exist

## Files Fixed

### API Routes
- ✅ `src/app/api/marketplace/services/route.ts` - Main marketplace API
- ✅ `src/app/api/panel/public/services/route.ts` - Public services API
- ✅ `src/app/api/discovery/resources/route.ts` - Discovery endpoint
- ✅ `src/app/api/panel/platform/services/route.ts` - Platform services API

### Sync Functions
- ✅ `src/lib/payai-sync.ts` - PayAI service sync function

## How It Works

### Before Migration Applied
- Queries use `select` to only fetch existing fields
- New field filters (type, source) are skipped
- Services sync without extended fields
- App continues to work normally

### After Migration Applied
- Queries use full schema (all fields)
- All filters work correctly
- Extended fields are saved and queried
- Full functionality available

## Next Steps: Apply Migration

The migration file exists at: `prisma/migrations/20251106_add_marketplace_discovery_fields/migration.sql`

### Option 1: Automatic (Railway)
If deployed on Railway, migrations run automatically on deployment via `scripts/start.sh`.

### Option 2: Manual via Railway CLI
```bash
railway run npx prisma migrate deploy
```

### Option 3: Manual via Railway Dashboard
1. Go to Railway → Your Project → Next.js Service
2. Click "Deployments" → Select latest deployment
3. Click "View Logs" → Click "Shell" button
4. Run: `npx prisma migrate deploy`

### Option 4: Local Development
```bash
npm run db:deploy
# or
npx prisma migrate deploy
```

## Verification

After applying migration, check logs for:
```
✓ Database migrations completed successfully
```

Or verify via health endpoint:
```bash
curl https://your-app.up.railway.app/api/health/db
```

The response should show the migration was applied.

## Migration Details

The migration adds these columns to the `Service` table:
- `type` (TEXT) - Service type: api, nft_mint, token, content, other
- `method` (TEXT) - HTTP method: GET, POST, etc.
- `inputSchema` (JSONB) - Input schema from 402 preflight
- `outputSchema` (JSONB) - Output schema from 402 preflight
- `source` (TEXT) - Source: payai, x402scan
- `isExternal` (BOOLEAN) - true if from external merchant
- `websiteUrl` (TEXT) - Website URL for APIFLASH screenshot
- `screenshotUrl` (TEXT) - Cached APIFLASH screenshot URL

All columns are nullable except `isExternal` (defaults to `false`).

## Status

✅ **Code is now migration-safe** - App works with or without migration applied
⏳ **Migration ready to apply** - Run `npx prisma migrate deploy` when ready

