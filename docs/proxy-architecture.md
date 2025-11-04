# Proxy Architecture - x402 Through Next.js

## Overview

Instead of calling the Express x402 server directly from the browser (which requires CORS), we now proxy requests through Next.js API routes. This eliminates CORS issues entirely.

## Architecture

```
Browser (https://r1xlabs.com)
  ↓
Next.js API Route (/api/r1x-agent/chat) ← Same origin, no CORS
  ↓
Express Server (https://api.r1xlabs.com) ← Server-to-server, no CORS needed
  ↓
PayAI Facilitator
```

## How It Works

### Client-Side (Browser)
- Calls Next.js API routes: `/api/r1x-agent/chat` or `/api/x402/pay`
- Same origin (`https://r1xlabs.com`), so no CORS issues
- Uses `x402-fetch` as recommended by PayAI docs

### Server-Side (Next.js API Routes)
- Receive request from browser
- Forward to Express server using `X402_SERVER_URL` env var
- Forward headers (including `X-Payment` for payment proofs)
- Return Express response to browser

### Express Server
- Handles payment verification via PayAI `paymentMiddleware`
- Returns 402 Payment Required or service fulfillment
- No CORS configuration needed (only called server-to-server)

## Environment Variables

### Next.js Service (Railway)
```env
# Required for server-side proxy
X402_SERVER_URL=https://api.r1xlabs.com

# Optional (for other purposes)
NEXT_PUBLIC_BASE_URL=https://r1xlabs.com
```

**Important**: `NEXT_PUBLIC_X402_SERVER_URL` is **no longer needed**. Client code uses Next.js API routes directly.

### Express Service (Railway)
```env
# Standard PayAI configuration
MERCHANT_ADDRESS=0x...
FACILITATOR_URL=https://facilitator.payai.network
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...
ANTHROPIC_API_KEY=...
```

**Note**: CORS configuration can be removed from Express server since it's only called server-to-server.

## Benefits

1. **No CORS issues** - Browser always calls same origin
2. **Simpler configuration** - No CORS headers needed
3. **PayAI compliant** - Still uses `paymentMiddleware` exactly as documented
4. **Same security** - Express server still validates payments via PayAI
5. **Cleaner architecture** - Clear separation: client → Next.js → Express

## API Routes

### `/api/r1x-agent/chat`
- Proxies to Express `/api/r1x-agent/chat`
- Handles x402 payment flow via `x402-fetch`
- Returns chat responses from Anthropic

### `/api/x402/pay`
- Proxies to Express `/api/x402/pay`
- Handles marketplace payment requests
- Returns payment quotes or verification results

## Code Changes

### Client Code
**Before:**
```typescript
const x402ServerUrl = await getX402ServerUrlAsync();
const response = await fetchWithPayment(`${x402ServerUrl}/api/r1x-agent/chat`, {...});
```

**After:**
```typescript
// Same origin, no URL needed
const response = await fetchWithPayment('/api/r1x-agent/chat', {...});
```

### Server Code
**Before:** Browser → Express (CORS required)

**After:** Browser → Next.js API → Express (no CORS needed)

## Verification

1. Check browser console - should see calls to `/api/r1x-agent/chat` (same origin)
2. Check Next.js logs - should see proxy forwarding requests
3. Check Express logs - should see requests from Next.js (server-to-server)
4. No CORS errors in browser console

## PayAI Compliance

✅ Still uses `paymentMiddleware` exactly as PayAI docs specify
✅ Still uses `x402-fetch` on client as PayAI recommends
✅ Payment flow unchanged - only routing changed
✅ Express server configuration unchanged

This is just a routing change, not a protocol change. All PayAI/x402 functionality remains identical.

