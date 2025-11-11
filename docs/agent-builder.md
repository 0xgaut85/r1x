# r1x Agent Builder Documentation

## Overview

**r1x Agent Builder** is a no-code platform for building AI agents with built-in x402 payment capabilities. Build custom agents that can discover services, quote prices, and pay autonomously—all without writing code.

**Status**: UI is complete and live. Backend implementation in progress.

---

## What is Agent Builder?

Agent Builder lets you create AI agents that:

- **Think** - Powered by LLMs (Claude, GPT, etc.)
- **Pay** - Automatically handle x402 payments
- **Discover** - Find and evaluate services from the r1x Marketplace
- **Deploy** - One-click deployment to production

**Think of it as**: Zapier meets AutoGPT meets crypto wallets.

---

## Key Features

### 1. Visual Workflow Builder

Drag-and-drop interface for composing agent logic:

- **Contexts** - Define stateful data structures (user preferences, session state, etc.)
- **Actions** - Define agent capabilities (API calls, data processing, etc.)
- **x402 Services** - Integrate paid services from the marketplace
- **Workflow** - Connect components visually

**Inspired by**: Dreams SDK's context composition patterns

### 2. Context Builder

Define stateful contexts for your agents:

```typescript
// Example context definition
{
  schema: {
    userId: 'string',
    preferences: {
      language: 'string',
      currency: 'string',
    },
  },
  memory: {
    recentInteractions: [],
    preferences: {},
  },
}
```

**Features**:
- Schema validation (Zod-based)
- Persistent memory
- Context composition
- Type-safe context access

### 3. Action Builder

Define agent actions with input/output schemas:

```typescript
// Example action definition
{
  name: 'processPayment',
  schema: {
    amount: 'number',
    recipient: 'string',
    serviceId: 'string',
  },
  handler: async (params, context) => {
    // Automatically handles x402 payment flow
    const result = await x402Client.pay({
      amount: params.amount,
      service: params.serviceId,
    });
    return { success: true, txHash: result.txHash };
  },
}
```

**Features**:
- Input/output schema validation
- Automatic x402 payment handling
- Service integration
- Error handling

### 4. x402 Integration

Built-in payment capabilities:

- **Automatic Payment Detection** - Agents detect HTTP 402 responses
- **Payment Flow** - Parse quotes, request approval, sign transactions
- **Multi-chain Support** - Base (EVM) and Solana networks
- **Spending Limits** - Set max payment amounts per agent
- **Auto-approval** - Configure trusted services for automatic payment

**Payment Flow**:
1. Agent detects HTTP 402 Payment Required
2. Parses payment quote (price, currency, payment details)
3. Requests wallet approval (or auto-approves if trusted)
4. Signs USDC payment transaction
5. Retries request with `X-Payment` header
6. Service verifies payment and executes

### 5. Service Discovery

Browse and integrate services from the r1x Marketplace:

- **Real-time Discovery** - Live marketplace data
- **Network Filtering** - Filter by Base or Solana
- **Category Browsing** - AI Inference, Data Streams, Compute, etc.
- **Price Comparison** - See prices and fees upfront
- **One-click Integration** - Add services to your agent workflow

**Available Services**:
- PayAI services
- Base Network services
- Solana services
- Daydreams services
- Custom x402 services

### 6. Wallet Management

Multi-chain wallet support:

- **Base Network** - Connect via Reown AppKit (Coinbase Wallet, MetaMask, etc.)
- **Solana** - Connect via Phantom, Solflare, etc.
- **Connection Status** - See connected networks and addresses
- **Spending Limits** - Configure per-agent spending caps
- **Transaction History** - Track agent payments

---

## Architecture

### Frontend (Current - Complete)

```
src/app/agent-builder/
├── page.tsx                    # Main page (SSR disabled)
├── layout.tsx                   # Metadata and layout
└── AgentBuilderContent.tsx      # Main UI component

src/components/agent-builder/
├── AgentCanvas.tsx              # Visual workflow builder
├── ContextBuilder.tsx           # Context definition UI
├── ActionBuilder.tsx            # Action definition UI
├── X402Integration.tsx         # x402 payment flow UI
├── ServiceDiscovery.tsx         # Marketplace service browser
└── WalletConnectionSection.tsx  # Multi-chain wallet UI
```

### Backend (In Progress)

```
src/app/api/agent-builder/
├── agents/
│   ├── route.ts                 # GET, POST (list/create)
│   └── [agentId]/
│       ├── route.ts             # GET, PUT, DELETE
│       ├── deploy/route.ts       # POST deploy
│       └── execute/route.ts      # POST execute

src/lib/agent-builder/
├── runtime/
│   ├── index.ts                 # Main runtime exports
│   ├── agent.ts                 # Agent class
│   ├── entrypoint.ts            # Entrypoint handler
│   ├── context.ts               # Context system
│   ├── action.ts                # Action system
│   └── x402-wrapper.ts          # x402 client wrapper
├── codegen.ts                   # Code generation
├── deployment.ts                # Deployment service
└── types.ts                     # TypeScript types
```

### Database Schema

```prisma
model Agent {
  id              String   @id @default(cuid())
  agentId        String   @unique
  name            String
  description     String?
  ownerAddress    String
  network         String   @default("base")
  chainId         Int?
  
  definition      Json     // Full agent config
  
  deployed        Boolean  @default(false)
  deployedAt      DateTime?
  endpoint        String?
  version         String   @default("1.0.0")
  
  x402Enabled     Boolean  @default(true)
  maxPaymentAmount String?
  autoApprove     Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  executions      AgentExecution[]
}

model AgentExecution {
  id              String   @id @default(cuid())
  agentId         String
  agent           Agent    @relation(...)
  
  entrypoint      String
  input           Json?
  output          Json?
  status          String
  errorMessage    String?
  
  paymentTxHash   String?
  paymentAmount   String?
  
  executedAt      DateTime @default(now())
}
```

---

## How It Works

### 1. Build Your Agent

1. **Connect Wallets** - Connect Base and/or Solana wallets
2. **Define Contexts** - Create stateful data structures
3. **Create Actions** - Define agent capabilities
4. **Build Workflow** - Drag-and-drop components on canvas
5. **Add Services** - Integrate x402 services from marketplace
6. **Configure x402** - Set spending limits and auto-approval rules

### 2. Save Agent

- Agent definition saved to database
- Linked to your wallet address
- Version controlled
- Editable anytime

### 3. Deploy Agent

- Code generated from visual definition
- Deployed to serverless runtime
- Endpoint URL provided
- Agent becomes callable via HTTP

### 4. Execute Agent

- Call agent endpoint with input
- Agent executes workflow
- Automatically handles x402 payments
- Returns result

---

## Integration with r1x Infrastructure

Agent Builder integrates seamlessly with existing r1x infrastructure:

### x402 Payment Protocol

- Uses existing `X402Client` (via wrapper, no modifications)
- Supports Base and Solana networks
- Automatic payment handling
- On-chain verification

### Marketplace

- Discovers services from `/api/marketplace/services`
- Real-time service data
- Network filtering
- Price comparison

### Wallet Integration

- Uses existing `WalletProvider` (no modifications)
- Reown AppKit for Base/EVM
- Solana wallet adapters
- Multi-chain support

### Database

- Uses existing Prisma setup
- New models only (additive)
- No modifications to existing models

---

## API Reference

### Create Agent

```http
POST /api/agent-builder/agents
Content-Type: application/json

{
  "agentId": "my-agent",
  "name": "My Agent",
  "description": "Agent description",
  "ownerAddress": "0x...",
  "network": "base",
  "definition": {
    "contexts": [...],
    "actions": [...],
    "workflow": [...],
    "x402Config": {
      "enabled": true,
      "maxPaymentAmount": "100",
      "autoApprove": false
    }
  }
}
```

### List Agents

```http
GET /api/agent-builder/agents?ownerAddress=0x...
```

### Get Agent

```http
GET /api/agent-builder/agents/[agentId]
```

### Update Agent

```http
PUT /api/agent-builder/agents/[agentId]
Content-Type: application/json

{
  "name": "Updated Name",
  "definition": {...}
}
```

### Deploy Agent

```http
POST /api/agent-builder/agents/[agentId]/deploy
```

**Response**:
```json
{
  "endpoint": "https://agent-xyz.vercel.app/api/execute",
  "deployed": true,
  "deployedAt": "2025-01-XX..."
}
```

### Execute Agent

```http
POST /api/agent-builder/agents/[agentId]/execute
Content-Type: application/json

{
  "entrypoint": "main",
  "input": {
    "query": "Process this request"
  }
}
```

---

## Code Generation

Agent Builder generates TypeScript code from visual definitions:

```typescript
import { createAgentApp } from '@r1x/agent-runtime';
import { z } from 'zod';

// Generated contexts
const UserContext = createContext({
  schema: z.object({
    userId: z.string(),
    preferences: z.object({
      language: z.string(),
      currency: z.string(),
    }),
  }),
  memory: {
    recentInteractions: [],
    preferences: {},
  },
});

// Generated actions
const ProcessPaymentAction = createAction({
  name: 'processPayment',
  schema: z.object({
    amount: z.number(),
    recipient: z.string(),
    serviceId: z.string(),
  }),
  handler: async (params, context) => {
    // Auto-handles x402 payment
    const result = await x402Client.pay({
      amount: params.amount,
      service: params.serviceId,
    });
    return { success: true, txHash: result.txHash };
  },
});

// Generated agent app
const { app, addEntrypoint } = createAgentApp({
  name: 'my-agent',
  version: '1.0.0',
  ownerAddress: '0x...',
  network: 'base',
  x402Config: {
    enabled: true,
    maxPaymentAmount: '100',
    autoApprove: false,
  },
});

addEntrypoint({
  key: 'main',
  description: 'Main entrypoint',
  input: z.object({
    query: z.string(),
  }),
  async handler({ input }) {
    // Execute workflow
    return { result: '...' };
  },
});

export default app;
```

---

## Deployment Options

### Option 1: Vercel Serverless (Recommended)

- Automatic scaling
- Edge deployment
- Zero configuration
- Free tier available

### Option 2: Railway

- Docker containers
- Custom domains
- Persistent storage
- Full control

### Option 3: Cloudflare Workers

- Edge runtime
- Global distribution
- Low latency
- Pay-per-use pricing

---

## Roadmap

### Phase 1: Foundation ✅ (UI Complete)
- [x] Visual workflow builder UI
- [x] Context builder UI
- [x] Action builder UI
- [x] x402 integration UI
- [x] Service discovery UI
- [x] Wallet connection UI

### Phase 2: Backend (In Progress)
- [ ] Database schema
- [ ] API routes
- [ ] Agent runtime engine
- [ ] Code generation
- [ ] Deployment service

### Phase 3: Advanced Features (Planned)
- [ ] Agent templates
- [ ] Agent marketplace
- [ ] Agent analytics
- [ ] Multi-agent workflows
- [ ] ERC-8004 identity integration

---

## Examples

### Example 1: Simple Payment Agent

**Workflow**:
1. Receive request
2. Discover relevant service
3. Pay for service
4. Return result

**Use Case**: Autonomous service purchasing

### Example 2: Context-Aware Agent

**Workflow**:
1. Load user context
2. Process request with context
3. Update context
4. Return response

**Use Case**: Personalized AI assistants

### Example 3: Multi-Service Agent

**Workflow**:
1. Receive query
2. Discover multiple services
3. Compare prices
4. Select best service
5. Pay and execute
6. Aggregate results

**Use Case**: Service orchestration

---

## Best Practices

### 1. Context Design

- Keep contexts focused and scoped
- Use schemas for validation
- Minimize memory footprint
- Clear naming conventions

### 2. Action Design

- Single responsibility per action
- Clear input/output schemas
- Error handling
- Idempotent operations

### 3. x402 Configuration

- Set realistic spending limits
- Use auto-approval sparingly
- Monitor agent expenses
- Review payment history

### 4. Workflow Design

- Keep workflows simple
- Avoid circular dependencies
- Test before deployment
- Document complex workflows

---

## Troubleshooting

### Agent Not Saving

- Check wallet connection
- Verify network (Base/Solana)
- Check browser console for errors
- Ensure agentId is unique

### Deployment Fails

- Check agent definition validity
- Verify code generation
- Check deployment service status
- Review deployment logs

### Payment Not Working

- Verify wallet has USDC balance
- Check spending limits
- Verify network (Base/Solana)
- Check x402 configuration

---

## Support

- **Documentation**: https://www.r1xlabs.com/docs/agent-builder
- **Telegram**: https://t.me/r1xbuilders
- **GitHub**: https://github.com/0xLaylo/r1x-402

---

## References

- [Lucid Agents](https://github.com/daydreamsai/lucid-agents) - Inspiration for runtime patterns
- [Dreams SDK](https://github.com/daydreamsai) - Context composition patterns
- [x402 Protocol](https://docs.payai.network/x402/reference) - Payment protocol
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) - Agent identity specification

---

## License

MIT

---

**Last Updated**: January 2025  
**Status**: UI Complete, Backend In Development

