# Railway Environment Variable Build-Time Issue - Fix Guide

## Problem

You're seeing this error:
```
Cannot connect to x402 server (http://localhost:4021). Please check:
1. Server is running
2. NEXT_PUBLIC_X402_SERVER_URL is set correctly
3. CORS is configured
```

## Root Cause

**Next.js `NEXT_PUBLIC_*` environment variables are embedded at BUILD TIME, not runtime.**

This means:
1. If `NEXT_PUBLIC_X402_SERVER_URL` is not set **before** Railway builds your app, it defaults to `http://localhost:4021`
2. Even if you set the env var **after** deployment, the build already happened with the wrong value baked in
3. The JavaScript bundle contains `http://localhost:4021` hardcoded

## Solution 1: Set Environment Variables BEFORE Build (Recommended)

**This is the proper fix for production:**

1. **Before deploying to Railway:**
   - Go to Railway → Your Next.js Service → Variables
   - Set `NEXT_PUBLIC_X402_SERVER_URL=https://api.r1xlabs.com` (or your x402 server URL)
   - Set `X402_SERVER_URL=https://api.r1xlabs.com` (for runtime config API)

2. **Deploy/Redeploy:**
   - Railway will build with the correct env var
   - The value will be embedded in the JavaScript bundle
   - No runtime fetching needed

3. **Verify:**
   - Check browser console for `[Agent] Calling x402 server:` log
   - Should show `https://api.r1xlabs.com`, not `http://localhost:4021`

## Solution 2: Runtime Config API (Fallback)

**We've implemented a fallback that works even if build-time env var is missing:**

1. **Set `X402_SERVER_URL` in Railway** (not `NEXT_PUBLIC_*`):
   - This is a server-side env var, so it's available at runtime
   - Go to Railway → Your Next.js Service → Variables
   - Set `X402_SERVER_URL=https://api.r1xlabs.com`

2. **The code will automatically:**
   - Check if `NEXT_PUBLIC_X402_SERVER_URL` is set (build-time)
   - If missing or localhost, fetch from `/api/config/x402-server-url` endpoint
   - This endpoint reads `X402_SERVER_URL` at runtime (not build-time)

3. **Verify:**
   - Check browser console for `[x402-server-url] Using runtime config URL:` log
   - Should show `https://api.r1xlabs.com`

## How It Works

### Build-Time Variables (NEXT_PUBLIC_*)
- Embedded during `npm run build`
- Available immediately in client-side code
- **Must be set before build**

### Runtime Variables (without NEXT_PUBLIC_*)
- Available only on server-side
- Can be set/updated after deployment
- Accessed via API endpoints

### Our Implementation

1. **`getX402ServerUrlAsync()`** - New async function:
   - Checks build-time `NEXT_PUBLIC_X402_SERVER_URL` first
   - Falls back to runtime config API if missing
   - Used in `R1xAgentContent.tsx` and `marketplace/page.tsx`

2. **`/api/config/x402-server-url`** - Runtime config endpoint:
   - Reads `X402_SERVER_URL` (server-side env var)
   - Returns URL at runtime
   - Cached per session for performance

3. **`getX402ServerUrl()`** - Sync function (backwards compatible):
   - Still works for existing code
   - Logs warning if using localhost in production
   - Deprecated, use async version for new code

## Railway Deployment Checklist

### Initial Setup
- [ ] Set `NEXT_PUBLIC_X402_SERVER_URL` **before first build**
- [ ] Set `X402_SERVER_URL` (for runtime fallback)
- [ ] Set `NEXT_PUBLIC_BASE_URL` (your Next.js app URL)
- [ ] Deploy

### If You Already Deployed Without Env Vars
- [ ] Set `X402_SERVER_URL` in Railway (runtime fallback will work)
- [ ] Optionally redeploy with `NEXT_PUBLIC_X402_SERVER_URL` set for optimal performance

## Testing

1. **Check build-time var:**
   ```javascript
   // In browser console
   console.log(process.env.NEXT_PUBLIC_X402_SERVER_URL);
   // Should show: https://api.r1xlabs.com (not undefined or localhost)
   ```

2. **Check runtime config API:**
   ```bash
   curl https://www.r1xlabs.com/api/config/x402-server-url
   # Should return: {"url":"https://api.r1xlabs.com","source":"X402_SERVER_URL"}
   ```

3. **Check logs:**
   - Browser console should show: `[Agent] Calling x402 server: https://api.r1xlabs.com`
   - If you see `http://localhost:4021`, the build-time var wasn't set

## Troubleshooting

### Still seeing localhost?

1. **Check Railway build logs:**
   - Look for `NEXT_PUBLIC_X402_SERVER_URL` in build output
   - If not found, Railway didn't have it during build

2. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Or clear site data

3. **Check runtime config:**
   - Visit `/api/config/x402-server-url` directly
   - Should return your x402 server URL

4. **Verify Railway env vars:**
   - Railway → Service → Variables
   - Both `NEXT_PUBLIC_X402_SERVER_URL` and `X402_SERVER_URL` should be set
   - Make sure no typos (case-sensitive)

## PayAI/x402 Documentation

- [PayAI x402 Documentation](https://docs.payai.network/x402)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## Summary

**Best Practice:** Set `NEXT_PUBLIC_X402_SERVER_URL` before deploying.

**Fallback:** Set `X402_SERVER_URL` and the runtime config API will handle it.

**Current Status:** Code now supports both approaches, with runtime fallback working automatically.

