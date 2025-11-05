# x402scan Integration Guide

## Correct Endpoint for x402scan

**The actual x402 service endpoint**:
- `POST https://www.r1xlabs.com/api/r1x-agent/chat`

This is the endpoint that should be featured on x402scan. It's a paid service endpoint that:
- Returns `402 Payment Required` on first request (without payment)
- Returns `200 OK` with AI response after payment verification
- Charges `$0.25 USDC` per message
- **Each new user = +1 user** (unique wallet address)
- **Each paid message = +1 transaction** (saved automatically)

## How It Works

### User & Transaction Counting

✅ **1 new user = unique wallet address** (`from` field in transaction)
✅ **1 paid message = 1 transaction** (saved to database automatically)

### Payment Flow

1. User sends `POST /api/r1x-agent/chat` with message
2. **First request**: Express server returns `402 Payment Required` with payment quote
3. Client (x402-fetch) prompts user to sign transaction
4. User signs USDC payment on Base network
5. Client retries request with `X-Payment` header containing payment proof
6. Express middleware verifies payment with PayAI facilitator
7. Transaction saved to database automatically
8. AI response generated and returned

### Transaction Saving

Every verified payment automatically creates:
- **Transaction record** with status `verified`
- **Service record** (`r1x-agent-chat`) if doesn't exist
- **Fee record** (if `FEE_RECIPIENT_ADDRESS` configured)

## x402scan Requirements

### 1. X402 Response (✅ Working)

The endpoint correctly:
- ✅ Returns `402 Payment Required` on first request
- ✅ Includes x402 headers (`X-Payment-Required`, `X-Payment-Quote`, etc.)
- ✅ Parses payment proof from `X-Payment` header
- ✅ Validates schema via PayAI middleware

### 2. Page Metadata (⚠️ Needs Fix)

For x402scan to display the service properly, the endpoint page needs:

**Current Status**:
- ❌ OG image missing
- ❌ OG description missing  
- ❌ Favicon missing

**Required**:
- ✅ OG image: Service preview image
- ✅ OG description: "Chat with r1x AI Agent. $0.25 per message."
- ✅ Favicon: r1x logo

## Testing the Endpoint

### Test with curl

```bash
# First request (should return 402)
curl -X POST https://www.r1xlabs.com/api/r1x-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Response: 402 Payment Required with payment quote
```

### Expected 402 Response

```json
{
  "error": "Payment Required",
  "accepts": [
    {
      "maxAmountRequired": "250000",
      "payTo": "0x0D644cFE30F0777CcCa6563618D9519D6b8979ac",
      "network": "base",
      "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    }
  ]
}
```

## Statistics

- **Service ID**: `r1x-agent-chat`
- **Service Name**: `r1x Agent Chat`
- **Price**: `$0.25 USDC` per message
- **Network**: `base` (Base mainnet)
- **Chain ID**: `8453`
- **Token**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC)
- **Merchant**: `0x0D644cFE30F0777CcCa6563618D9519D6b8979ac`

## Public API Endpoints (Optional)

For displaying stats on x402scan:

- `GET https://www.r1xlabs.com/api/panel/public/services` - Service catalog
- `GET https://www.r1xlabs.com/api/panel/public/transactions` - Transaction history

These show:
- Total transactions count
- Unique users count
- Total volume
- Recent activity

## Next Steps

1. ✅ Endpoint returns proper 402 responses
2. ✅ Transactions saved automatically
3. ⚠️ Add OG metadata to endpoint page
4. ⚠️ Add favicon
5. ✅ Share endpoint URL with x402scan: `https://www.r1xlabs.com/api/r1x-agent/chat`

