# r1x API Endpoints Reference

Complete list of all API endpoints in the r1x platform.

## Base URLs

- **Next.js Service**: `https://www.r1xlabs.com` (or your Railway domain)
- **Express x402 Server**: `https://api.r1xlabs.com` (or your Railway Express domain)

---

## Next.js API Routes

### AI Agent

#### `POST /api/r1x-agent/chat`
**Description**: Chat with r1x AI Agent (requires payment)
**Price**: $0.25 USDC per message
**Proxy**: Proxies to Express server `/api/r1x-agent/chat`

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "Your message here" }
  ]
}
```

**Headers**:
- `X-Payment`: Payment proof (automatically added by x402-fetch)

**Response**:
```json
{
  "message": "AI response text"
}
```

**Status Codes**:
- `200`: Success - AI response sent
- `402`: Payment Required - Payment quote returned
- `500`: Server error

---

### x402 Payment

#### `POST /api/x402/pay`
**Description**: Process payment for marketplace services
**Proxy**: Proxies to Express server `/api/x402/pay`

**Request**:
```json
{
  "serviceId": "service-id",
  "serviceName": "Service Name",
  "price": "0.01"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified, service access granted"
}
```

---

### Marketplace

#### `GET /api/marketplace/services`
**Description**: List available services from database

**Query Parameters**:
- `category` (optional): Filter by category
- `merchant` (optional): Filter by merchant address
- `network` (optional): Network identifier (default: `base`)
- `chainId` (optional): Chain ID (default: `8453`)

**Response**:
```json
{
  "services": [
    {
      "id": "service-id",
      "name": "Service Name",
      "description": "Description",
      "category": "AI Agent",
      "merchant": "0x...",
      "price": "0.25",
      "priceDisplay": "0.25",
      "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "tokenSymbol": "USDC"
    }
  ],
  "total": 1
}
```

---

### PayAI Sync

#### `POST /api/sync/payai`
**Description**: Sync services from PayAI facilitator to database

**Headers** (optional):
- `Authorization`: `Bearer YOUR_SYNC_SECRET`

**Response**:
```json
{
  "success": true,
  "synced": 10,
  "errors": 0,
  "message": "Synced 10 services, 0 errors"
}
```

**Also supports**: `GET /api/sync/payai` (same as POST)

---

### Health & Debug

#### `GET /api/health/db`
**Description**: Database health check endpoint

**Response**:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "tables": {
      "found": 4,
      "expected": 4,
      "missing": [],
      "allPresent": true
    },
    "data": {
      "services": 5,
      "transactions": 42,
      "fees": 42
    },
    "migrations": {
      "pending": 0,
      "lastMigration": "20250103000000_init"
    }
  }
}
```

#### `GET /api/debug/echo`
**Description**: Debug endpoint - echoes request data

#### `GET /api/config/x402-server-url`
**Description**: Get x402 server URL configuration (server-side only)

---

## User Panel APIs

### `GET /api/panel/user/stats`
**Description**: Get user statistics and summary

**Query Parameters**:
- `address` (required): User wallet address

**Response**:
```json
{
  "address": "0x...",
  "stats": {
    "totalTransactions": 42,
    "totalSpent": "125.50",
    "uniqueServicesUsed": 8,
    "transactionsByCategory": {
      "AI Agent": 20,
      "Other": 22
    }
  },
  "recentTransactions": [
    {
      "id": "...",
      "transactionHash": "0x...",
      "serviceName": "r1x Agent Chat",
      "amount": "0.25",
      "fee": "0.0125",
      "status": "verified",
      "timestamp": "2025-01-05T...",
      "blockExplorerUrl": "https://basescan.org/tx/0x..."
    }
  ]
}
```

### `GET /api/panel/user/transactions`
**Description**: Get user's transaction history

**Query Parameters**:
- `address` (required): User wallet address
- `limit` (optional): Number of results (default: `50`)
- `offset` (optional): Pagination offset (default: `0`)
- `status` (optional): Filter by status (`pending`, `verified`, `settled`, `failed`)

**Response**:
```json
{
  "transactions": [...],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### `GET /api/panel/user/usage`
**Description**: Get user usage statistics and charts data

**Query Parameters**:
- `address` (required): User wallet address
- `period` (optional): Time period (`7d`, `30d`, `90d`, `all`) - default: `30d`

**Response**:
```json
{
  "period": "30d",
  "summary": {
    "totalTransactions": 42,
    "totalAmount": "125.50",
    "totalFees": "6.28",
    "uniqueServices": 8
  },
  "dailyUsage": [
    {
      "date": "2025-01-01",
      "transactions": 5,
      "amount": "1.25",
      "fees": "0.06"
    }
  ],
  "usageByService": [
    {
      "serviceId": "r1x-agent-chat",
      "serviceName": "r1x Agent Chat",
      "category": "AI Agent",
      "count": 20,
      "amount": "5.00"
    }
  ]
}
```

---

## Platform Panel APIs

### `GET /api/panel/platform/analytics`
**Description**: Get platform-wide analytics and metrics

**Query Parameters**:
- `period` (optional): Time period (`7d`, `30d`, `90d`, `all`) - default: `30d`

**Response**:
```json
{
  "period": "30d",
  "summary": {
    "totalTransactions": 1250,
    "totalVolume": "12500.00",
    "totalFees": "625.00",
    "uniqueUsers": 150,
    "activeServices": 12
  },
  "dailyStats": [...],
  "topServices": [...],
  "statusBreakdown": {
    "pending": 10,
    "verified": 800,
    "settled": 440
  },
  "userGrowth": [...]
}
```

### `GET /api/panel/platform/fees`
**Description**: Get fee collection analytics

**Query Parameters**:
- `period` (optional): Time period (`7d`, `30d`, `90d`, `all`) - default: `30d`
- `recipient` (optional): Filter by fee recipient address

**Response**:
```json
{
  "period": "30d",
  "summary": {
    "totalFees": "625.00",
    "transferredFees": "600.00",
    "pendingFees": "25.00",
    "totalRecords": 1250,
    "transferredCount": 1200,
    "pendingCount": 50
  },
  "dailyFees": [...],
  "feesByRecipient": [...],
  "recentFees": [...]
}
```

### `GET /api/panel/platform/services`
**Description**: Get service performance analytics

**Query Parameters**:
- `period` (optional): Time period (`7d`, `30d`, `90d`, `all`) - default: `30d`

**Response**:
```json
{
  "period": "30d",
  "summary": {
    "totalServices": 12,
    "activeServices": 10,
    "totalTransactions": 1250,
    "totalVolume": "12500.00",
    "totalFees": "625.00"
  },
  "services": [
    {
      "serviceId": "r1x-agent-chat",
      "name": "r1x Agent Chat",
      "totalTransactions": 800,
      "totalVolume": "200.00",
      "totalFees": "10.00",
      "uniqueUsers": 120
    }
  ]
}
```

---

## Public APIs (for x402scan/Partners)

### `GET /api/panel/public/services`
**Description**: Public service catalog endpoint for partners/x402scan

**Query Parameters**:
- `category` (optional): Filter by category
- `network` (optional): Network identifier (default: `base`)
- `chainId` (optional): Chain ID (default: `8453`)

**Response**:
```json
{
  "services": [
    {
      "id": "r1x-agent-chat",
      "name": "r1x Agent Chat",
      "description": "AI chat assistant",
      "category": "AI Agent",
      "merchant": "0x...",
      "network": "base",
      "chainId": 8453,
      "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "tokenSymbol": "USDC",
      "price": "0.25",
      "priceWei": "250000",
      "endpoint": "/api/r1x-agent/chat",
      "totalPurchases": 800,
      "createdAt": "2025-01-01T...",
      "updatedAt": "2025-01-05T..."
    }
  ],
  "total": 1,
  "network": "base",
  "chainId": 8453
}
```

### `GET /api/panel/public/transactions`
**Description**: Public transaction summaries for partners/x402scan

**Query Parameters**:
- `limit` (optional): Number of results (default: `100`)
- `offset` (optional): Pagination offset (default: `0`)
- `serviceId` (optional): Filter by service ID
- `status` (optional): Filter by status (`verified`, `settled`)

**Response**:
```json
{
  "transactions": [
    {
      "transactionHash": "0x...",
      "blockNumber": 12345678,
      "service": {
        "id": "r1x-agent-chat",
        "name": "r1x Agent Chat",
        "category": "AI Agent"
      },
      "amount": "0.25",
      "fee": "0.0125",
      "status": "verified",
      "timestamp": "2025-01-05T...",
      "blockExplorerUrl": "https://basescan.org/tx/0x..."
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Express x402 Server Endpoints

### `POST /api/r1x-agent/chat`
**Description**: AI Agent chat endpoint (protected by PayAI middleware)
**Price**: $0.25 USDC per message
**Middleware**: PayAI payment verification

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "Your message" }
  ]
}
```

**Headers**:
- `X-Payment`: Payment proof (required after first 402)

**Response**:
```json
{
  "message": "AI response from Claude"
}
```

**Status Codes**:
- `200`: Success
- `402`: Payment Required (first request)
- `500`: Server error

### `POST /api/x402/pay`
**Description**: Generic payment endpoint (protected by PayAI middleware)
**Price**: $0.01 USDC (configurable)

**Request**:
```json
{
  "serviceId": "service-id",
  "serviceName": "Service Name",
  "price": "0.01"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified, service access granted"
}
```

### `GET /health`
**Description**: Health check endpoint

**Response**:
```json
{
  "status": "ok",
  "server": "x402-express",
  "facilitator": "https://facilitator.payai.network",
  "merchant": "0x..."
}
```

---

## Endpoint Summary

### Next.js Service (Frontend + API Routes)
- `POST /api/r1x-agent/chat` - AI Agent chat (proxy)
- `POST /api/x402/pay` - Payment processing (proxy)
- `GET /api/marketplace/services` - Marketplace services
- `POST /api/sync/payai` - Sync PayAI services
- `GET /api/health/db` - Database health check
- `GET /api/panel/user/stats` - User statistics
- `GET /api/panel/user/transactions` - User transactions
- `GET /api/panel/user/usage` - User usage data
- `GET /api/panel/platform/analytics` - Platform analytics
- `GET /api/panel/platform/fees` - Fee analytics
- `GET /api/panel/platform/services` - Service analytics
- `GET /api/panel/public/services` - Public service catalog
- `GET /api/panel/public/transactions` - Public transactions

### Express x402 Server (Payment Processing)
- `POST /api/r1x-agent/chat` - AI Agent chat (with payment verification)
- `POST /api/x402/pay` - Payment processing (with payment verification)
- `GET /health` - Health check

---

## For x402scan Integration

**Share these endpoints**:
1. `GET https://www.r1xlabs.com/api/panel/public/services`
2. `GET https://www.r1xlabs.com/api/panel/public/transactions`

**Service Details**:
- Service ID: `r1x-agent-chat`
- Service Name: `r1x Agent Chat`
- Price: `$0.25 USDC` per message
- Network: `base`
- Chain ID: `8453`
- Token: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC)

**Transaction Tracking**:
- Each paid message = 1 transaction record
- Each unique wallet address = 1 user
- Transactions automatically saved after payment verification

