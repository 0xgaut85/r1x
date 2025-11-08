# x402 Server URL Fix - Summary

## Problem Identified

**Error:** `Cannot connect to x402 server (http://localhost:4021)`

**Root Cause:** Next.js `NEXT_PUBLIC_*` environment variables are embedded at **BUILD TIME**, not runtime. If `NEXT_PUBLIC_X402_SERVER_URL` wasn't set during Railway's build process, it defaults to `http://localhost:4021` and gets baked into the JavaScript bundle.

## Solutions Implemented

### 1. Runtime Config API Endpoint
**File:** `src/app/api/config/x402-server-url/route.ts`
- New API endpoint that reads `X402_SERVER_URL` at runtime (not build-time)
- Provides fallback when build-time env var is missing
- Works even after deployment without rebuild

### 2. Enhanced x402 Server URL Utility
**File:** `src/lib/x402-server-url.ts`
- **`getX402ServerUrlAsync()`** - New async function:
  - Checks build-time `NEXT_PUBLIC_X402_SERVER_URL` first
  - Falls back to runtime config API if missing
  - Caches result per session for performance
- **`getX402ServerUrl()`** - Sync function (backwards compatible):
  - Still works but logs warnings in production
  - Deprecated, use async version for new code

### 3. Updated Components
- **`src/app/r1x-agent/R1xAgentContent.tsx`** - Uses `getX402ServerUrlAsync()`
- **`src/app/marketplace/page.tsx`** - Uses `getX402ServerUrlAsync()`
- Both now support runtime config fallback

### 4. Documentation
- **`docs/railway-env-var-build-time-fix.md`** - Comprehensive guide
- **`docs/railway-checklist.md`** - Updated troubleshooting section

## How to Fix Your Deployment

### Option 1: Set Build-Time Variable (Recommended)
1. Go to Railway → Your Next.js Service → Variables
2. Set `NEXT_PUBLIC_X402_SERVER_URL=https://api.r1xlabs.com`
3. Redeploy (Railway will rebuild with correct value)

### Option 2: Use Runtime Config (Works Immediately)
1. Go to Railway → Your Next.js Service → Variables
2. Set `X402_SERVER_URL=https://api.r1xlabs.com`
3. No rebuild needed - runtime config API will handle it

### Option 3: Set Both (Best Practice)
Set both variables for optimal performance:
- `NEXT_PUBLIC_X402_SERVER_URL` - For build-time embedding (faster)
- `X402_SERVER_URL` - For runtime fallback (more flexible)

## Technical Details

### Why Build-Time vs Runtime Matters

**Next.js Environment Variables:**
- `NEXT_PUBLIC_*` vars → Embedded in JavaScript bundle during `npm run build`
- Non-prefixed vars → Only available server-side at runtime

**Railway Build Process:**
1. Railway clones your repo
2. Runs `npm ci` and `npm run build`
3. If `NEXT_PUBLIC_X402_SERVER_URL` isn't set, Next.js uses fallback
4. JavaScript bundle contains `http://localhost:4021` hardcoded
5. Even if you set env var after build, it's too late

**Our Solution:**
- Check build-time var first (instant, no network call)
- If missing, fetch from `/api/config/x402-server-url` (runtime API)
- API reads `X402_SERVER_URL` which is available at runtime
- Cache result to avoid repeated fetches

## Verification

After deploying, check:

1. **Browser Console:**
   ```
   [Agent] Calling x402 server: https://api.r1xlabs.com
   ```
   Should show your actual URL, not `http://localhost:4021`

2. **Runtime Config API:**
   ```bash
   curl https://www.r1xlabs.com/api/config/x402-server-url
   ```
   Should return: `{"url":"https://api.r1xlabs.com","source":"X402_SERVER_URL"}`

3. **Check Build Logs:**
   Railway → Service → Deployments → Build Logs
   Look for `NEXT_PUBLIC_X402_SERVER_URL` in build output

## Files Changed

- ✅ `src/lib/x402-server-url.ts` - Added async function and runtime fallback
- ✅ `src/app/api/config/x402-server-url/route.ts` - New runtime config endpoint
- ✅ `src/app/r1x-agent/R1xAgentContent.tsx` - Updated to use async version
- ✅ `src/app/marketplace/page.tsx` - Updated to use async version
- ✅ `docs/railway-env-var-build-time-fix.md` - Comprehensive fix guide
- ✅ `docs/railway-checklist.md` - Updated troubleshooting

## Next Steps

1. **Set `X402_SERVER_URL` in Railway** (immediate fix)
2. **Optionally set `NEXT_PUBLIC_X402_SERVER_URL`** and redeploy (optimal)
3. **Test the agent** - should connect to `https://api.r1xlabs.com`
4. **Monitor logs** - check for runtime config API calls

## References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [PayAI x402 Documentation](https://docs.payai.network/x402)
- Detailed fix guide: `docs/railway-env-var-build-time-fix.md`

