# r1x - The Payment Infrastructure for the Machine Economy

From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.

Robots buying from robots. Agents paying agents. Machines transacting autonomously. We're building the payment infrastructure.

## What is r1x?

The next economy isn't human. It's autonomous. No accounts. No subscriptions. No dashboards. Just machines buying capabilities per request. One transaction at a time.

Robotics workloads are SPIKY. A delivery bot needs intensive mapping for 30 seconds, then navigates autonomously for hours. Why pay monthly for what you use sporadically?

**The old model is broken. THE NEW MODEL:**

One request = One price = One payment

Pay per frame. Pay per minute. Pay per route. No lock-in. No contracts. Every transaction is verifiable on-chain. Complete transparency.

## Core Utilities

### 1. x402 Payment Protocol
- **HTTP 402 Payment Required**, reborn for machines
- Quote a price, pay from wallet, retry with proof
- No accounts. No API keys. No humans. Just machines transacting
- Built on Base network with USDC
- Every payment is on-chain. Every transaction is verifiable

### 2. r1x Agent
- An AI agent that thinks, pays, and accesses the world
- Powered by Claude 3 Opus
- Understands x402 and purchases resources autonomously
- Pay-per-message pricing ($0.25 per message)
- Create resources robots will buy. Build services agents will pay for

### 3. Marketplace
- The marketplace for the machine economy
- Browse AI inference services robots can purchase
- Discover compute resources agents can buy
- Access data streams machines can consume
- Real-time service discovery. Everything priced. Everything payable

### 4. User & Platform Panels
- Watch the machine economy unfold in real-time
- Monitor every transaction. Track every autonomous purchase
- Create resources that robots will buy
- Set prices that agents will pay
- Complete analytics. Full transparency

### 5. SDK & APIs
- Build the future of machine commerce
- Express middleware for x402 (`x402-server/`)
- Public APIs for service discovery
- Transaction tracking and verification
- Wallet integration for Base network
- Everything you need to make your services machine-payable

## Robotics Use Cases

Robots compose capabilities like software. Buy perception when uncertain. Purchase routes when lost. Escalate to human control only when needed.

- **Buy perception when uncertain**: A delivery bot needs intensive mapping for 30 seconds, then navigates autonomously for hours. Pay per frame for vision APIs. Pay per image for OCR. No monthly lock-in
- **Purchase routes when lost**: Buy HD map tiles per route segment. Pay per minute for navigation. Why pay monthly for what you use sporadically?
- **Escalate to human control only when needed**: Pay for teleoperation by the minute when autonomy hits edge cases. Machines buying human expertise only when needed. One request at a time
- **Robots compose capabilities like software**: Publish LiDAR sweeps. Consume sensor data from other robots. Build real-time sensor networks. A bazaar where autonomous services transact directly
- **Infrastructure becomes machine-payable**: Reserve charging slots per use. Pay for docking bays when docking. The physical world becomes machine-payable. No subscriptions. Just pay for what you use

## Architecture

```
r1x Platform
├── Next.js Frontend (www.r1xlabs.com)
│   ├── Marketplace UI
│   ├── User & Platform Panels
│   ├── r1x Agent Chat Interface
│   └── Documentation
│
├── Express x402 Server (api.r1xlabs.com)
│   ├── x402 Middleware
│   ├── /api/r1x-agent/chat
│   └── /api/x402/pay
│
└── PostgreSQL Database
    ├── Services
    ├── Transactions
    └── Analytics
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Base network wallet
- USDC for transactions

### Installation

```bash
# Clone the repository
git clone https://github.com/0xLaylo/r1x-402.git
cd x402robotics

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

See `docs/railway-env-vars.md` for complete list of required environment variables.

Key variables:
- `MERCHANT_ADDRESS` - Your merchant wallet address
- `ANTHROPIC_API_KEY` - For r1x Agent
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_X402_SERVER_URL` - Express server URL

## Documentation

- [x402 Integration Guide](docs/x402-integration.md)
- [API Endpoints](API-ENDPOINTS.md)
- [Utilities Reference](src/app/docs/utilities/page.tsx)
- [Railway Deployment](RAILWAY-MIGRATION.md)

## Key Features

- ✅ x402 Payment Protocol implementation
- ✅ On-chain settlement and verification
- ✅ Base network support (USDC)
- ✅ r1x Agent with Claude 3 Opus
- ✅ Marketplace for the machine economy
- ✅ User & Platform panels
- ✅ Express middleware for x402
- ✅ Real-time transaction tracking
- ✅ TypeScript utilities and SDK
- ✅ Trustless machine commerce

## License

MIT

## Links

- Website: https://www.r1xlabs.com
- API: https://api.r1xlabs.com
- Documentation: https://www.r1xlabs.com/docs
