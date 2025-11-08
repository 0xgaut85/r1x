# Configuration Verification - PayAI/x402 Compliance

## ✅ Express Service (daring-analysis / r1x-server)

### Environment Variables (PayAI Required)
- ✅ `MERCHANT_ADDRESS` = `0x0D644cFE30F0777CcCa6563618D9519D6b8979ac`
- ✅ `FACILITATOR_URL` = `https://facilitator.payai.network`
- ✅ `CDP_API_KEY_ID` = Set (for Base mainnet)
- ✅ `CDP_API_KEY_SECRET` = Set (for Base mainnet)
- ✅ `ANTHROPIC_API_KEY` = Set
- ✅ `NETWORK` = `BASE`

### PayAI Middleware Configuration
- ✅ Uses `paymentMiddleware` from `x402-express` (official PayAI library)
- ✅ Format matches PayAI docs exactly:
  ```typescript
  paymentMiddleware(
    payTo,  // MERCHANT_ADDRESS
    {
      'POST /api/r1x-agent/chat': {
        price: '$0.25',    // ✅ Correct format
        network: 'base',   // ✅ Base mainnet
      },
      'POST /api/x402/pay': {
        price: '$0.01',
        network: 'base',
      },
    },
    {
      url: facilitatorUrl,  // ✅ PayAI facilitator
    },
  )
  ```

### Routes
- ✅ `POST /api/r1x-agent/chat` - $0.25 USDC
- ✅ `POST /api/x402/pay` - $0.01 USDC
- ✅ `GET /health` - Health check

### Domain
- ✅ Custom domain: `https://server.r1xlabs.com`
- ✅ Railway domain: `https://daring-analysis-production.up.railway.app`

### Code Compliance
- ✅ Server listens on `0.0.0.0` (required for Railway)
- ✅ Uses PORT from environment (Railway sets this)
- ✅ Routes defined after middleware (middleware intercepts first)

---

## ✅ Next.js Service (r1x)

### Environment Variables
- ✅ `X402_SERVER_URL` = `https://server.r1xlabs.com` (for server-side proxy)
- ✅ `NEXT_PUBLIC_BASE_URL` = `https://www.r1xlabs.com`
- ⚠️ `NEXT_PUBLIC_X402_SERVER_URL` = `https://api.r1xlabs.com` (not needed anymore, but harmless)

### Proxy Routes (PayAI Compliant)
- ✅ `/api/r1x-agent/chat` - Proxies to Express `/api/r1x-agent/chat`
- ✅ `/api/x402/pay` - Proxies to Express `/api/x402/pay`
- ✅ Preserves 402 status codes for x402-fetch
- ✅ Forwards X-Payment headers correctly

### Client Code (PayAI Compliant)
- ✅ Uses `x402-fetch` (`wrapFetchWithPayment`) as PayAI recommends
- ✅ Calls Next.js API routes (same origin, no CORS)
- ✅ Format: `wrapFetchWithPayment(fetch, walletClient, maxValue)`

### Architecture
- ✅ Browser → Next.js API routes (same origin)
- ✅ Next.js API → Express server (server-to-server)
- ✅ Express → PayAI facilitator (payment verification)

---

## ✅ PayAI/x402 Protocol Compliance

### Server Side (Express)
- ✅ **100% Compliant** - Uses `paymentMiddleware` exactly as PayAI docs
- ✅ Returns HTTP 402 Payment Required (handled by middleware)
- ✅ Verifies payments via PayAI facilitator
- ✅ CDP API keys configured for Base mainnet

### Client Side (Next.js)
- ✅ **100% Compliant** - Uses `x402-fetch` as PayAI recommends
- ✅ Handles 402 responses automatically
- ✅ Generates payment proofs via x402-fetch
- ✅ Sends X-Payment header correctly

### Payment Flow
1. ✅ Client calls `/api/r1x-agent/chat` (Next.js)
2. ✅ Next.js proxies to Express server
3. ✅ Express middleware checks payment (via PayAI)
4. ✅ If no payment → Returns 402 with quote
5. ✅ x402-fetch detects 402 → Generates payment proof
6. ✅ Client signs transaction → Sends with X-Payment header
7. ✅ Express middleware verifies payment → Fulfills request

---

## ⚠️ Minor Issues / Recommendations

### 1. NEXT_PUBLIC_X402_SERVER_URL
- **Status**: Set but not needed (we use proxy architecture)
- **Action**: Can be removed (harmless if left)

### 2. CORS Configuration
- **Status**: CORS configured in Express (not needed for server-to-server)
- **Action**: Can be simplified (Express only called server-to-server now)

### 3. Domain Cleanup
- **Status**: Both `api.r1xlabs.com` and `server.r1xlabs.com` exist
- **Action**: Can remove `api.r1xlabs.com` if not needed

---

## ✅ Summary

**Express Service**: ✅ 100% PayAI Compliant
- All required env vars set
- paymentMiddleware configured correctly
- Routes match PayAI documentation format

**Next.js Service**: ✅ 100% PayAI Compliant  
- Uses x402-fetch as recommended
- Proxy architecture eliminates CORS
- Correctly forwards 402 responses

**Overall**: ✅ **Everything is configured correctly per PayAI/x402 docs!**

The only remaining step is DNS propagation for `server.r1xlabs.com`, then everything should work perfectly.

