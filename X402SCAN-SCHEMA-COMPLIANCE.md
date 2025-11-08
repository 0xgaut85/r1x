# x402scan Schema Compliance

## Overview

x402scan requires a stricter schema than the default x402 schema. We've added a middleware transformer to convert PayAI middleware responses to x402scan format.

## x402scan Required Schema

```typescript
type X402Response = {
  x402Version: number,
  error?: string,
  accepts?: Array<Accepts>,
  payer?: string
}

type Accepts = {
  scheme: "exact",
  network: "base",
  maxAmountRequired: string,
  resource: string,
  description: string,
  mimeType: string,
  payTo: string,
  maxTimeoutSeconds: number,
  asset: string,
  outputSchema?: {
    input: {
      type: "http",
      method: "GET" | "POST",
      bodyType?: "json" | "form-data" | "multipart-form-data" | "text" | "binary",
      queryParams?: Record<string, FieldDef>,
      bodyFields?: Record<string, FieldDef>,
      headerFields?: Record<string, FieldDef>
    },
    output?: Record<string, any>
  },
  extra?: Record<string, any>
}
```

## Implementation

**File**: `x402-server/x402scan-response.ts`

A middleware that:
1. Intercepts all responses from PayAI middleware
2. Transforms 402 responses to x402scan format
3. Preserves all other responses unchanged

**Middleware Order**:
```typescript
app.use(paymentMiddleware(...)); // PayAI middleware
app.use(x402scanResponseTransformer); // Transform 402s to x402scan format
app.use(errorHandler); // Error handler
// Route handlers
```

## Example Transformed Response

When `POST /api/r1x-agent/chat` returns 402:

```json
{
  "x402Version": 1,
  "error": "Payment Required",
  "accepts": [
    {
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "250000",
      "resource": "https://server.r1xlabs.com/api/r1x-agent/chat",
      "description": "r1x Agent Chat - AI Assistant",
      "mimeType": "application/json",
      "payTo": "0x0D644cFE30F0777CcCa6563618D9519D6b8979ac",
      "maxTimeoutSeconds": 3600,
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "outputSchema": {
        "input": {
          "type": "http",
          "method": "POST",
          "bodyType": "json",
          "bodyFields": {
            "messages": {
              "type": "array",
              "required": true,
              "description": "Array of chat messages",
              "properties": {
                "role": {
                  "type": "string",
                  "required": true,
                  "enum": ["user", "assistant"],
                  "description": "Message role"
                },
                "content": {
                  "type": "string",
                  "required": true,
                  "description": "Message content"
                }
              }
            }
          }
        },
        "output": {
          "message": {
            "type": "string",
            "description": "AI assistant response"
          }
        }
      },
      "extra": {
        "serviceId": "r1x-agent-chat",
        "serviceName": "r1x Agent Chat",
        "price": "$0.25"
      }
    }
  ]
}
```

## Testing

Test the endpoint:

```bash
curl -X POST https://www.r1xlabs.com/api/r1x-agent/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

Expected: 402 with x402scan-compliant schema

## Verification Checklist

- ✅ `x402Version` present
- ✅ `accepts` array present
- ✅ All required `accepts` fields present:
  - ✅ `scheme: "exact"`
  - ✅ `network: "base"`
  - ✅ `maxAmountRequired` (string, in wei)
  - ✅ `resource` (full URL)
  - ✅ `description`
  - ✅ `mimeType`
  - ✅ `payTo` (merchant address)
  - ✅ `maxTimeoutSeconds`
  - ✅ `asset` (USDC address)
- ✅ `outputSchema` present (for chat endpoint)
- ✅ `extra` metadata present

## Notes

- PayAI middleware might return different formats
- Transformer handles multiple PayAI response formats
- Resource URL is built from request (`req.protocol://req.get('host')req.originalUrl`)
- Amount defaults to 250000 (0.25 USDC) if not found in PayAI response
- Description is route-specific

