# Proxy Architecture Migration - Summary

## What Changed

We've migrated from direct browser-to-Express calls (requiring CORS) to a proxy architecture through Next.js API routes.

### Before (CORS Required)
```
Browser → https://api.r1xlabs.com/api/r1x-agent/chat
  ❌ Different origin = CORS required
```

### After (No CORS)
```
Browser → /api/r1x-agent/chat (Next.js API route)
  ✅ Same origin = No CORS needed
  ↓
Next.js API → https://api.r1xlabs.com/api/r1x-agent/chat (Express)
  ✅ Server-to-server = No CORS needed
```

## Files Changed

### New Files
- `src/app/api/r1x-agent/chat/route.ts` - Next.js API route proxy
- `src/app/api/x402/pay/route.ts` - Next.js API route proxy
- `docs/proxy-architecture.md` - Architecture documentation

### Modified Files
- `src/app/r1x-agent/R1xAgentContent.tsx` - Now calls `/api/r1x-agent/chat`
- `src/app/marketplace/page.tsx` - Now calls `/api/x402/pay`
- `src/lib/agent-payment.ts` - Now calls `/api/x402/pay`
- `src/lib/x402-server-url.ts` - Updated docs, server-side only
- `docs/railway-env-vars.md` - Updated env var requirements
- `docs/railway-checklist.md` - Updated troubleshooting

## Environment Variables to Update

### Railway - Next.js Service

**Remove:**
- ~~`NEXT_PUBLIC_X402_SERVER_URL`~~ (no longer needed)

**Keep/Add:**
- `X402_SERVER_URL=https://api.r1xlabs.com` (for server-side proxy)
- `NEXT_PUBLIC_BASE_URL=https://r1xlabs.com` (if not already set)

### Railway - Express Service

**No changes needed** - Express server configuration unchanged

**Optional:** Can remove CORS configuration from Express since it's only called server-to-server now

## PayAI Compliance

✅ **Still 100% compliant with PayAI docs:**
- Express server still uses `paymentMiddleware` exactly as documented
- Client still uses `x402-fetch` as recommended
- Payment flow unchanged - only routing changed
- 402 responses properly forwarded
- Payment verification unchanged

## Benefits

1. **No CORS issues** - Browser always calls same origin
2. **Simpler configuration** - No CORS headers needed
3. **Better error messages** - Easier to debug (single origin)
4. **Same security** - Express still validates via PayAI
5. **Cleaner code** - Client code simpler (no URL management)

## Testing

After deployment, verify:

1. **Browser console:**
   - Should see calls to `/api/r1x-agent/chat` (not `api.r1xlabs.com`)
   - No CORS errors

2. **Next.js logs:**
   - Should see `[Next.js Proxy] Forwarding to Express server`

3. **Express logs:**
   - Should see requests from Next.js (server-to-server)

4. **Functionality:**
   - Payment flow should work exactly as before
   - x402-fetch should handle 402 responses correctly

## Migration Checklist

- [x] Create Next.js API proxy routes
- [x] Update client code to use Next.js routes
- [x] Update configuration helpers
- [x] Update documentation
- [ ] Deploy to Railway
- [ ] Update Railway env vars (remove NEXT_PUBLIC_X402_SERVER_URL, ensure X402_SERVER_URL is set)
- [ ] Test payment flow
- [ ] Verify no CORS errors

## Rollback

If needed, you can rollback by:
1. Reverting client code to use `getX402ServerUrlAsync()`
2. Re-adding CORS configuration to Express
3. Setting `NEXT_PUBLIC_X402_SERVER_URL` in Railway

But the proxy architecture is cleaner and recommended.

