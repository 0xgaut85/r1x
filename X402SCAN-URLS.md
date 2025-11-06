# x402scan URL Resources

## x402 Service Endpoints (to be listed on x402scan)

These are the actual x402-protected service endpoints that x402scan should discover and list.

### 1. r1x Agent Chat Service
**Endpoint**: `POST https://server.r1xlabs.com/api/r1x-agent/chat`

**Description**: AI Agent chat service - $0.25 USDC per message

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "Your message here" }
  ]
}
```

**Response**:
- `402 Payment Required`: First request - payment quote included
- `200 OK`: After payment - AI response returned

**Headers** (after payment):
- `X-Payment`: Payment proof (JSON-encoded)

**Service Details**:
- Service Name: `r1x Agent Chat`
- Price: `0.25 USDC` per message
- Network: `base`
- Chain ID: `8453`
- Token: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC)
- Merchant: `0x0D644cFE30F0777CcCa6563618D9519D6b8979ac`

---

### 2. r1x Agent Plan Service
**Endpoint**: `POST https://server.r1xlabs.com/api/r1x-agent/plan`

**Description**: AI agent service discovery and planning - $0.01 USDC per request

**Request**:
```json
{
  "query": "mint meme token",
  "category": "mint",
  "budgetMax": "1.0"
}
```

**Response**:
- `402 Payment Required`: First request - payment quote included
- `200 OK`: After payment - ranked service proposals returned

**Headers** (after payment):
- `X-Payment`: Payment proof (JSON-encoded)

**Service Details**:
- Service Name: `r1x Agent Plan`
- Price: `0.01 USDC` per request
- Network: `base`
- Chain ID: `8453`
- Token: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC)
- Merchant: `0x0D644cFE30F0777CcCa6563618D9519D6b8979ac`

---

### 3. Generic x402 Payment Endpoint
**Endpoint**: `POST https://server.r1xlabs.com/api/x402/pay`

**Description**: Generic payment endpoint for marketplace services

**Request**:
```json
{
  "serviceId": "service-id",
  "serviceName": "Service Name",
  "price": "0.01",
  "basePrice": "0.01",
  "isExternal": false,
  "endpoint": "https://example.com/api"
}
```

**Response**:
- `402 Payment Required`: Payment quote
- `200 OK`: Payment verified, access granted

---

## Alternative Endpoints (via Next.js proxy)

These endpoints proxy to the Express server above:

### 4. r1x Agent Chat (via Next.js)
**Endpoint**: `POST https://www.r1xlabs.com/api/r1x-agent/chat`

**Description**: Same as #1, but proxied through Next.js (same origin, no CORS)

---

### 5. r1x Agent Plan (via Next.js)
**Endpoint**: `POST https://www.r1xlabs.com/api/r1x-agent/plan`

**Description**: Same as #2, but proxied through Next.js (same origin, no CORS)

---

### 6. Generic Payment (via Next.js)
**Endpoint**: `POST https://www.r1xlabs.com/api/x402/pay`

**Description**: Same as #2, but proxied through Next.js

---

## Public Discovery Endpoints (for x402scan to fetch service list)

### 3. Public Service Catalog
**Endpoint**: `GET https://server.r1xlabs.com/api/panel/public/services`

**Description**: Public service catalog for x402scan to discover all available x402 services

**Query Parameters**:
- `category` (optional): Filter by category (e.g., "AI", "Compute", "Data")
- `network` (optional): Network identifier (default: `base`)
- `chainId` (optional): Chain ID (default: `8453`)

**Alternative** (Next.js proxy):
- `GET https://www.r1xlabs.com/api/panel/public/services`

---

### 4. Public Transactions
**Endpoint**: `GET https://server.r1xlabs.com/api/panel/public/transactions`

**Description**: Public transaction summary for x402scan to display transaction history

**Query Parameters**:
- `limit` (optional): Number of results (default: `100`, max: `1000`)
- `offset` (optional): Pagination offset (default: `0`)
- `serviceId` (optional): Filter by service ID
- `status` (optional): Filter by status (`verified`, `settled`)

**Alternative** (Next.js proxy):
- `GET https://www.r1xlabs.com/api/panel/public/transactions`

---

## Summary for x402scan

### Primary x402 Service Endpoints (to list/discover):

1. **r1x Agent Chat Service**
   ```
   POST https://server.r1xlabs.com/api/r1x-agent/chat
   ```
   - Price: 0.25 USDC per message
   - Network: Base (8453)
   - Token: USDC

2. **r1x Agent Plan Service**
   ```
   POST https://server.r1xlabs.com/api/r1x-agent/plan
   ```
   - Price: 0.01 USDC per request
   - Network: Base (8453)
   - Token: USDC
   - Returns ranked service proposals for autonomous purchasing

3. **Generic Payment Endpoint**
   ```
   POST https://server.r1xlabs.com/api/x402/pay
   ```
   - For marketplace services
   - Variable pricing

### Discovery Endpoints (to fetch service catalog):

3. **Public Service Catalog**
   ```
   GET https://server.r1xlabs.com/api/panel/public/services
   ```
   (Also available at: `https://www.r1xlabs.com/api/panel/public/services`)

4. **Public Transactions**
   ```
   GET https://server.r1xlabs.com/api/panel/public/transactions
   ```
   (Also available at: `https://www.r1xlabs.com/api/panel/public/transactions`)

---

## Network Information

- **Network**: Base (Ethereum L2)
- **Chain ID**: 8453
- **Token**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Explorer**: BaseScan (`https://basescan.org`)

---

## Notes

- All endpoints return JSON
- Public endpoints don't require authentication
- Transaction endpoints use pagination (limit/offset)
- Service endpoints support filtering by category, network, merchant
- All prices are in USDC (6 decimals)
- Transaction hashes link to BaseScan explorer

