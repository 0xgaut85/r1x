# r1x Agent as x402 Resource

## Overview

The r1x Agent is available as a paid x402 resource that other agents, services, and applications can call programmatically. It's discoverable on x402scan and follows the x402 payment protocol.

## Available Endpoints

### 1. r1x Agent Chat (`/api/r1x-agent/chat`)

**Price**: $0.25 USDC per message  
**Network**: Base (chainId: 8453)  
**Token**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)

**Endpoint URLs**:
- Direct: `POST https://server.r1xlabs.com/api/r1x-agent/chat`
- Via Next.js proxy: `POST https://www.r1xlabs.com/api/r1x-agent/chat`

**Request Format**:
```json
{
  "messages": [
    { "role": "user", "content": "Your question here" },
    { "role": "assistant", "content": "Previous response..." }
  ]
}
```

**Response**:
- `402 Payment Required`: First request - includes payment quote
- `200 OK`: After payment - returns AI response

**Response Format** (after payment):
```json
{
  "message": "AI assistant response text"
}
```

**Usage Example** (using x402-fetch):
```typescript
import { wrapFetchWithPayment } from 'x402-fetch';

const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  walletClient,
  BigInt(0.25 * 10 ** 6) // 0.25 USDC max
);

const response = await fetchWithPayment(
  'https://server.r1xlabs.com/api/r1x-agent/chat',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'What is x402?' }
      ]
    })
  }
);

const data = await response.json();
console.log(data.message);
```

### 2. r1x Agent Plan (`/api/r1x-agent/plan`)

**Price**: $0.01 USDC per request  
**Network**: Base (chainId: 8453)  
**Token**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)

**Endpoint URLs**:
- Direct: `POST https://server.r1xlabs.com/api/r1x-agent/plan`
- Via Next.js proxy: `POST https://www.r1xlabs.com/api/r1x-agent/plan`

**Request Format**:
```json
{
  "query": "mint meme token",
  "category": "mint",
  "budgetMax": "1.0"
}
```

**Response**:
- `402 Payment Required`: First request - includes payment quote
- `200 OK`: After payment - returns ranked service proposals

**Response Format** (after payment):
```json
{
  "proposals": [
    {
      "serviceId": "service-id",
      "name": "Service Name",
      "category": "mint",
      "price": "0.5",
      "priceWithFee": "0.525",
      "merchant": "0x...",
      "network": "base",
      "resource": "https://service-endpoint.com/api",
      "schemaSummary": {
        "method": "POST",
        "contentType": "application/json"
      }
    }
  ],
  "total": 5,
  "query": "mint meme token",
  "category": "mint"
}
```

**Usage Example** (using x402-fetch):
```typescript
import { wrapFetchWithPayment } from 'x402-fetch';

const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  walletClient,
  BigInt(0.01 * 10 ** 6) // 0.01 USDC max
);

const response = await fetchWithPayment(
  'https://server.r1xlabs.com/api/r1x-agent/plan',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'mint meme token',
      category: 'mint',
      budgetMax: '1.0'
    })
  }
);

const data = await response.json();
console.log(data.proposals); // Ranked service proposals
```

## Capabilities

### r1x Agent Chat
- Conversational AI assistant powered by Claude 3 Opus
- Specialized in r1x infrastructure, x402 protocol, and machine economy
- Can answer questions, provide guidance, and explain concepts
- Maintains conversation context across messages

### r1x Agent Plan
- Service discovery and planning
- Finds relevant marketplace services based on query and category
- Returns ranked proposals with pricing and endpoint information
- Filters by budget constraints
- Refreshes marketplace data every 60 seconds

## Discovery

### Via x402scan
Both endpoints are discoverable on x402scan:
- They return x402-compliant `402 Payment Required` responses
- Include full schema information in `accepts` array
- Follow x402scan schema compliance standards

### Direct Discovery
You can discover the endpoints by:
1. Calling the endpoint without payment (will receive 402 with quote)
2. Parsing the `accepts` array for payment details
3. Using the `resource` field as the endpoint URL

## Payment Flow

1. **First Request**: Call endpoint without `X-Payment` header
   - Receives `402 Payment Required` response
   - Response includes payment quote in `accepts` array

2. **Payment**: Use x402-fetch or similar client library
   - Automatically handles payment transaction
   - Signs USDC payment on Base network
   - Retries request with `X-Payment` header

3. **Service Access**: After payment verification
   - Receives `200 OK` with service response
   - Payment is verified on-chain via PayAI facilitator

## Integration Examples

### Node.js/TypeScript
```typescript
import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

const walletClient = createWalletClient({
  chain: base,
  transport: http()
});

const fetchWithPayment = wrapFetchWithPayment(
  fetch,
  walletClient,
  BigInt(0.25 * 10 ** 6)
);

// Use r1x Agent
const response = await fetchWithPayment(
  'https://server.r1xlabs.com/api/r1x-agent/chat',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello!' }]
    })
  }
);
```

### Python
```python
# Use x402-python client library (when available)
# Or implement x402 client following PayAI docs
```

## Use Cases

1. **Other AI Agents**: Call r1x Agent for specialized knowledge about x402 and machine economy
2. **Service Discovery**: Use Plan endpoint to find relevant marketplace services
3. **Automated Workflows**: Integrate r1x Agent into automated systems that need AI assistance
4. **Multi-Agent Systems**: Agents can call other agents as x402 resources

## Pricing

- **Chat**: $0.25 USDC per message
- **Plan**: $0.01 USDC per request

All payments settle on-chain on Base network. Every transaction is verifiable.

## Support

- **Documentation**: https://www.r1xlabs.com/docs
- **Marketplace**: https://www.r1xlabs.com/marketplace
- **x402scan**: Discover on x402scan.io

## Notes

- Both endpoints require Base network (chainId: 8453)
- Payments must be in USDC (6 decimals)
- x402-fetch handles payment flow automatically
- Endpoints are rate-limited by payment (pay-per-use)
- No API keys or accounts required - just wallet payments

