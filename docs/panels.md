# Panels Documentation

## Overview

The r1x platform includes two main panels for users and administrators:

- **User Panel** (`/user-panel`): Personal dashboard for users to view their purchase history, usage statistics, and transaction details
- **Platform Panel** (`/platform-panel`): Administrative dashboard for platform analytics, fee tracking, and service performance monitoring

## API Endpoints

### User Panel APIs

#### GET `/api/panel/user/stats`
Get user statistics and summary.

**Query Parameters:**
- `address` (required): User wallet address

**Response:**
```json
{
  "address": "0x...",
  "stats": {
    "totalTransactions": 42,
    "totalSpent": "125.50",
    "uniqueServicesUsed": 8,
    "transactionsByCategory": {
      "AI Inference": 20,
      "Data Streams": 15,
      "Other": 7
    }
  },
  "recentTransactions": [...]
}
```

#### GET `/api/panel/user/transactions`
Get user's transaction history.

**Query Parameters:**
- `address` (required): User wallet address
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (pending, verified, settled, failed)

**Response:**
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

#### GET `/api/panel/user/usage`
Get user usage statistics and charts data.

**Query Parameters:**
- `address` (required): User wallet address
- `period` (optional): Time period (7d, 30d, 90d, all) - default: 30d

**Response:**
```json
{
  "period": "30d",
  "summary": {
    "totalTransactions": 42,
    "totalAmount": "125.50",
    "totalFees": "6.28",
    "uniqueServices": 8
  },
  "dailyUsage": [...],
  "usageByService": [...]
}
```

#### GET `/api/panel/user/results`
Get service results/outputs for a user's purchases.

**Query Parameters:**
- `address` (required): User wallet address
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "results": [
    {
      "id": "clx...",
      "createdAt": "2025-01-07T12:00:00Z",
      "serviceId": "service-123",
      "serviceName": "AI Inference Service",
      "contentType": "application/json",
      "preview": "{\"result\": \"...\"}",
      "transactionHash": "0x...",
      "settlementHash": "0x..."
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0,
  "hasMore": false
}
```

#### GET `/api/panel/user/results/[id]`
Get full details of a specific service result.

**Query Parameters:**
- `address` (optional): User wallet address (for authorization check)

**Response:**
```json
{
  "id": "clx...",
  "createdAt": "2025-01-07T12:00:00Z",
  "service": {
    "id": "service-123",
    "name": "AI Inference Service",
    "description": "...",
    "category": "AI Inference",
    "endpoint": "https://..."
  },
  "contentType": "application/json",
  "resultText": null,
  "resultJson": { "result": "..." },
  "filename": null,
  "metadata": null,
  "transactionHash": "0x...",
  "settlementHash": "0x...",
  "transaction": {
    "amount": "250000",
    "feeAmount": "5000",
    "timestamp": "2025-01-07T12:00:00Z"
  }
}
```

### Purchase & Result Logging APIs

#### POST `/api/purchases/log`
Logs purchases made via x402 payments (both fee and service payments). Creates Transaction records for user panel visibility.

**Request Body:**
```json
{
  "serviceId": "service-123",
  "serviceName": "AI Inference Service",
  "payer": "0x...",
  "feeReceipt": "...",
  "serviceReceipt": "...",
  "feeAmount": "0.05",
  "servicePrice": "0.25",
  "type": "internal" // or "external"
}
```

#### POST `/api/purchases/result`
Logs service results/outputs after successful purchase. Creates ServiceResult records linked to transactions.

**Request Body:**
```json
{
  "serviceId": "service-123",
  "payer": "0x...",
  "serviceReceipt": "...",
  "contentType": "application/json",
  "resultJson": { "result": "..." }, // for JSON responses
  "resultText": "...", // for text responses
  "filename": "output.pdf", // for binary responses
  "metadata": { "contentType": "application/pdf" } // optional
}
```

**Response:**
```json
{
  "success": true,
  "resultId": "clx...",
  "message": "Service result logged successfully"
}
```

#### GET `/api/panel/platform/analytics`
Get platform-wide analytics and metrics.

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, all) - default: 30d

**Response:**
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
  "statusBreakdown": {...},
  "userGrowth": [...]
}
```

#### GET `/api/panel/platform/fees`
Get fee collection analytics.

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, all) - default: 30d
- `recipient` (optional): Filter by fee recipient address

**Response:**
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

#### GET `/api/panel/platform/services`
Get service performance analytics.

**Query Parameters:**
- `period` (optional): Time period (7d, 30d, 90d, all) - default: 30d

**Response:**
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
  "services": [...]
}
```

### Public APIs

#### GET `/api/panel/public/services`
Public endpoint for partners/x402scan to fetch service catalog.

**Query Parameters:**
- `category` (optional): Filter by category
- `network` (optional): Filter by network (default: base)
- `chainId` (optional): Filter by chain ID (default: 8453)

**Response:**
```json
{
  "services": [...],
  "total": 12,
  "network": "base",
  "chainId": 8453
}
```

#### GET `/api/panel/public/transactions`
Public endpoint for transaction summaries.

**Query Parameters:**
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)
- `serviceId` (optional): Filter by service ID
- `status` (optional): Filter by status (verified, settled)

**Response:**
```json
{
  "transactions": [...],
  "pagination": {
    "total": 5000,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

## Access Control

### User Panel
- Accessible to any authenticated user
- Users can only view their own data
- Address-based authentication (wallet connection)

### Platform Panel
- Admin-only access
- Configure admin addresses via `ADMIN_ADDRESSES` environment variable (comma-separated)
- Example: `ADMIN_ADDRESSES=0x123...,0x456...`

### Public APIs
- No authentication required
- Rate limiting recommended for production
- Suitable for external integrations (x402scan, partners)

## Usage Examples

### User Panel Integration

```typescript
// Fetch user stats
const response = await fetch(`/api/panel/user/stats?address=${userAddress}`);
const data = await response.json();

// Fetch transaction history
const txResponse = await fetch(
  `/api/panel/user/transactions?address=${userAddress}&limit=20`
);
const txData = await txResponse.json();

// Fetch usage analytics
const usageResponse = await fetch(
  `/api/panel/user/usage?address=${userAddress}&period=30d`
);
const usageData = await usageResponse.json();
```

### Platform Panel Integration

```typescript
// Fetch platform analytics
const analyticsResponse = await fetch(
  `/api/panel/platform/analytics?period=30d`
);
const analytics = await analyticsResponse.json();

// Fetch fee data
const feesResponse = await fetch(
  `/api/panel/platform/fees?period=30d`
);
const fees = await feesResponse.json();
```

### External Integration (x402scan)

```typescript
// Fetch service catalog
const servicesResponse = await fetch(
  'https://r1x.vercel.app/api/panel/public/services'
);
const services = await servicesResponse.json();

// Fetch recent transactions
const txResponse = await fetch(
  'https://r1x.vercel.app/api/panel/public/transactions?limit=50'
);
const transactions = await txResponse.json();
```

## Data Sources

All panel APIs pull data from:
- **Prisma Database**: Transaction and fee records
- **PayAI Facilitator**: Live service data and verification status
- **On-chain Data**: Transaction hashes, block numbers, verification status

## Charts & Visualizations

The panels use `recharts` for data visualization:
- Line charts for time-series data (daily usage, revenue, user growth)
- Bar charts for service performance comparisons
- Pie charts for status breakdowns

## Environment Variables

Required for panel functionality:
- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_ADDRESSES`: Comma-separated list of admin wallet addresses (optional)
- `FACILITATOR_URL`: PayAI facilitator endpoint (default: https://facilitator.payai.network)

## Future Enhancements

- [ ] Wallet connection integration (MetaMask, WalletConnect)
- [ ] Session-based authentication
- [ ] API rate limiting
- [ ] CSV export for all data endpoints
- [ ] Real-time updates via WebSocket
- [ ] Email notifications for transactions
- [ ] Advanced filtering and search
- [ ] Custom date range selection

