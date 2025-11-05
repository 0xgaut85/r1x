# Database Migration Guide

## Platform-Specific Setup

### Railway Setup (Recommended)
See **[Railway Database Setup Guide](./railway-database-setup.md)** for complete Railway configuration.

**Quick Railway Setup:**
1. Create PostgreSQL database service on Railway
2. Railway automatically generates `DATABASE_URL`
3. Migrations run automatically on startup via `scripts/start.sh`
4. Verify with: `GET /api/health/db`

### Vercel Setup (Legacy)
1. **Get Database URL from Vercel:**
   - Go to Vercel Dashboard → Storage → r1x-db
   - Copy the connection string
   - Add to Vercel Environment Variables as `DATABASE_URL`

2. **Run Initial Migration:**
   
   **Option A: Via Vercel CLI (Recommended)**
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

   **Option B: Via Vercel Dashboard**
   - Add build command: `prisma generate && prisma migrate deploy && next build`
   - Or use Vercel Postinstall script

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Migration Commands

- **Development**: `npm run db:migrate` - Creates and applies migrations
- **Production**: `npm run db:deploy` - Applies migrations without prompts
- **Studio**: `npm run db:studio` - Opens Prisma Studio GUI

## Schema Changes

When you modify `prisma/schema.prisma`:

1. Create migration: `npx prisma migrate dev --name description`
2. Test locally: `npm run dev`
3. Deploy: `npx prisma migrate deploy` (on Vercel)

## PayAI Sync

After database is set up, sync PayAI services:

```bash
# Via API
curl -X POST https://your-domain.vercel.app/api/sync/payai

# Or via Vercel CLI
vercel env pull .env.local
# Then call the endpoint
```

## Verification

### Health Check Endpoint (Railway)
```bash
curl https://your-app.up.railway.app/api/health/db
```

Returns database status, table counts, and migration information.

### Prisma Studio (Local Development)
Check database connection:
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

