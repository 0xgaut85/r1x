# How to Apply Database Migration

## The Problem

The Prisma schema includes new fields that don't exist in the database yet:
- `type`, `method`, `inputSchema`, `outputSchema`, `source`, `isExternal`, `websiteUrl`, `screenshotUrl`

Prisma Client was generated with the full schema, so it tries to query all fields, causing errors.

## Solution: Apply Migration + Regenerate Prisma Client

### Step 1: Apply the Migration

The migration file exists at: `prisma/migrations/20251106_add_marketplace_discovery_fields/migration.sql`

**On Railway (Production):**
```bash
railway run npx prisma migrate deploy
```

**Or via Railway Dashboard:**
1. Go to Railway → Your Project → Next.js Service
2. Click "Deployments" → Latest deployment
3. Click "View Logs" → "Shell" button
4. Run: `npx prisma migrate deploy`

**Local Development:**
```bash
npm run db:deploy
# or
npx prisma migrate deploy
```

### Step 2: Regenerate Prisma Client

After migration is applied, regenerate Prisma Client:

```bash
npm run db:generate
# or
npx prisma generate
```

**On Railway:** This happens automatically via `postinstall` script in `package.json`.

### Step 3: Restart Application

After migration and client regeneration:
- **Railway:** Redeploy or restart the service
- **Local:** Restart your dev server

## Verification

Check if migration was applied:

```bash
# Via health endpoint
curl https://your-app.up.railway.app/api/health/db

# Or check logs for:
✓ Database migrations completed successfully
```

## If Migration Fails

### Error: "Migration already applied"
This is OK - the migration was already run. Continue to Step 2.

### Error: "Can't reach database server"
1. Verify `DATABASE_URL` is set correctly
2. Check database service is running on Railway
3. Verify network connectivity

### Error: "Column already exists"
The migration uses `IF NOT EXISTS`, so this shouldn't happen. If it does, the columns already exist - continue to Step 2.

## Current Status

✅ **Code is migration-safe** - All queries handle missing columns gracefully
⏳ **Migration ready** - Run `npx prisma migrate deploy` when ready
⏳ **Client needs regeneration** - Run `npx prisma generate` after migration

## What the Migration Adds

- `type` (TEXT) - Service type: api, nft_mint, token, content, other
- `method` (TEXT) - HTTP method: GET, POST, etc.
- `inputSchema` (JSONB) - Input schema from 402 preflight
- `outputSchema` (JSONB) - Output schema from 402 preflight
- `source` (TEXT) - Source: payai, x402scan
- `isExternal` (BOOLEAN) - true if from external merchant (defaults to false)
- `websiteUrl` (TEXT) - Website URL for APIFLASH screenshot
- `screenshotUrl` (TEXT) - Cached APIFLASH screenshot URL

All columns are nullable except `isExternal` (has default value).

