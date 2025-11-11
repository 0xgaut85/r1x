# r1x Agent Builder Implementation Plan
## Inspired by Lucid Agents, Built for r1x

**Status**: Planning Phase  
**Goal**: Transform the visual Agent Builder UI into a fully functional no-code platform for building and deploying AI agents with x402 payment capabilities.

---

## ⚠️ CRITICAL CONSTRAINT: ISOLATION

**ALL Agent Builder code MUST be isolated from the rest of the codebase.**

### Isolation Rules:
1. **No modifications to existing files** - Only create new files
2. **Separate directories** - All agent builder code in `/agent-builder/` or `/agents/` folders
3. **Separate API routes** - All routes under `/api/agent-builder/` prefix
4. **Additive database changes only** - New models only, no modifications to existing models
5. **Separate libraries** - Agent runtime in isolated package/module
6. **No shared code changes** - Don't modify existing x402 client, wallet provider, etc.

### What This Means:
- ✅ Create new files: `src/lib/agent-builder/*`
- ✅ Create new API: `src/app/api/agent-builder/*`
- ✅ Add new Prisma models (don't modify existing)
- ❌ Don't modify: `src/lib/payments/x402Client.ts`
- ❌ Don't modify: `src/lib/wallet-provider.tsx`
- ❌ Don't modify: Existing marketplace code
- ❌ Don't modify: Existing API routes

---

## Overview

The current Agent Builder UI is excellent and will remain unchanged. This plan focuses on adding backend functionality inspired by [Lucid Agents](https://github.com/daydreamsai/lucid-agents) patterns while maintaining r1x's unique visual workflow builder.

### Key Principles
1. **Keep the UI** - The visual builder stays as-is
2. **Complete isolation** - Zero impact on existing codebase
3. **Lucid-inspired backend** - Use agent-kit patterns for runtime, entrypoints, and x402 integration
4. **r1x-first** - Integrate with existing x402 infrastructure (via new wrapper, not modifications)
5. **Progressive enhancement** - Start with MVP, add features incrementally

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Existing UI)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Visual Canvas│  │ Context      │  │ Action       │     │
│  │ Builder      │  │ Builder      │  │ Builder      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (New Implementation)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Agent CRUD   │  │ Code         │  │ Deployment   │     │
│  │ API          │  │ Generation   │  │ Service      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Saves/Deploys
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Agent Runtime (Lucid-inspired)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Agent Kit   │  │ Entrypoint   │  │ x402         │     │
│  │ Runtime      │  │ Handler      │  │ Middleware   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Uses
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Existing r1x Infrastructure                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ x402 Client  │  │ Marketplace  │  │ Wallet       │     │
│  │ (Base/Solana)│  │ Services     │  │ Integration  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema & Core API

### 1.1 Database Schema (Prisma)

**⚠️ ISOLATION**: Add new models only, don't modify existing models.

Add `Agent` and `AgentExecution` models to `prisma/schema.prisma` (append to end of file):

```prisma
model Agent {
  id              String   @id @default(cuid())
  agentId        String   @unique // Human-readable ID (e.g., "my-agent")
  name            String
  description     String?
  ownerAddress    String   // Wallet address of creator
  network         String   @default("base") // base, solana
  chainId         Int?     // 8453 for Base, null for Solana
  
  // Agent definition (JSON)
  definition      Json     // Full agent config: contexts, actions, workflow
  
  // Deployment
  deployed        Boolean  @default(false)
  deployedAt      DateTime?
  endpoint        String?  // Runtime endpoint URL
  version         String   @default("1.0.0")
  
  // x402 Configuration
  x402Enabled     Boolean  @default(true)
  maxPaymentAmount String? // Max USDC amount agent can pay
  autoApprove     Boolean  @default(false)
  
  // ERC-8004 Identity (optional, inspired by lucid-agents)
  identityAddress String?  // ERC-8004 identity contract address
  trustConfig     Json?    // Trust metadata
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  executions      AgentExecution[]
  
  @@index([ownerAddress])
  @@index([agentId])
  @@index([deployed])
  @@index([network])
}

model AgentExecution {
  id              String   @id @default(cuid())
  agentId         String
  agent           Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  entrypoint      String   // Which entrypoint was called
  input           Json?    // Input data
  output          Json?    // Output data
  status          String   // success, error, payment_required
  errorMessage    String?
  
  // Payment tracking
  paymentTxHash   String?
  paymentAmount   String?
  
  executedAt      DateTime @default(now())
  
  @@index([agentId])
  @@index([executedAt])
}
```

### 1.2 API Routes

**⚠️ ISOLATION**: All routes under `/api/agent-builder/` prefix to avoid conflicts.

**`POST /api/agent-builder/agents`** - Create new agent
- Validates wallet connection
- Saves agent definition
- Returns agent ID

**`GET /api/agent-builder/agents`** - List user's agents
- Filters by `ownerAddress` from wallet

**`GET /api/agent-builder/agents/[agentId]`** - Get agent definition
- Returns full agent config

**`PUT /api/agent-builder/agents/[agentId]`** - Update agent
- Validates ownership
- Updates definition

**`POST /api/agent-builder/agents/[agentId]/deploy`** - Deploy agent
- Generates runtime code
- Deploys to runtime service
- Updates `deployed` flag and `endpoint`

**`DELETE /api/agent-builder/agents/[agentId]`** - Delete agent
- Validates ownership
- Soft delete or hard delete

**`POST /api/agent-builder/agents/[agentId]/execute`** - Execute agent entrypoint
- Runtime execution endpoint
- Handles x402 payments automatically
- Returns execution result

---

## Phase 2: Agent Runtime Engine

### 2.1 Create Isolated Agent Runtime Module

**⚠️ ISOLATION**: Create in `src/lib/agent-builder/runtime/` directory, NOT as separate package.

Inspired by `@lucid-agents/agent-kit`, but adapted for r1x:

**Structure:**
```
src/lib/agent-builder/
  runtime/
    index.ts              // Main exports
    agent.ts              // Agent class
    entrypoint.ts         // Entrypoint handler
    context.ts            // Context system (Dreams-inspired)
    action.ts             // Action system
    x402-wrapper.ts       // Wrapper around existing x402Client (no modifications)
    codegen.ts            // Code generation utilities
```

**Core API (inspired by lucid-agents):**

```typescript
// packages/agent-runtime/src/index.ts
import { z } from 'zod';
import { createAgentApp } from './agent';
import { createContext } from './context';
import { createAction } from './action';

export interface AgentConfig {
  name: string;
  version: string;
  description?: string;
  ownerAddress: string;
  network: 'base' | 'solana';
  x402Config?: {
    maxPaymentAmount?: string;
    autoApprove?: boolean;
  };
}

export interface EntrypointConfig<TInput = any, TOutput = any> {
  key: string;
  description: string;
  input: z.ZodSchema<TInput>;
  handler: (params: { input: TInput; context: any }) => Promise<TOutput>;
}

export function createAgentApp(config: AgentConfig) {
  // Similar to lucid-agents agent-kit
  // But integrates with r1x x402 client
}

export function createContext(config: ContextConfig) {
  // Dreams SDK-inspired context system
}

export function createAction(config: ActionConfig) {
  // Action system with x402 integration
}
```

### 2.2 Integration with Existing x402 Client (Wrapper Only)

**⚠️ ISOLATION**: Create wrapper, don't modify existing x402Client.

Create `src/lib/agent-builder/runtime/x402-wrapper.ts`:

```typescript
// src/lib/agent-builder/runtime/x402-wrapper.ts
// Wrapper around existing x402Client - NO MODIFICATIONS TO ORIGINAL

import { X402Client } from '@/lib/payments/x402Client';

/**
 * Agent Builder wrapper for x402 client
 * This isolates agent builder usage from rest of codebase
 */
export class AgentX402Wrapper {
  private client: X402Client;
  
  constructor(config: { maxValue?: string }) {
    // Use existing x402Client without modifications
    this.client = new X402Client({
      maxValue: config.maxValue || '100000000', // Default max
    });
  }
  
  async handlePayment(error: any, serviceId: string) {
    // Wrapper logic that uses existing client
    // No modifications to original x402Client
  }
}
```

---

## Phase 3: Code Generation from Visual Builder

### 3.1 Agent Definition Format

From the visual canvas, generate this structure:

```typescript
interface AgentDefinition {
  name: string;
  description: string;
  contexts: ContextDefinition[];
  actions: ActionDefinition[];
  workflow: WorkflowNode[];
  x402Config: {
    enabled: boolean;
    maxPaymentAmount?: string;
    autoApprove: boolean;
  };
}

interface ContextDefinition {
  id: string;
  name: string;
  schema: Record<string, any>; // Zod schema
  memory: Record<string, any>;
}

interface ActionDefinition {
  id: string;
  name: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  handler: string; // Code or reference to service
  x402ServiceId?: string; // If action uses x402 service
}

interface WorkflowNode {
  id: string;
  type: 'context' | 'action' | 'x402' | 'output';
  position: { x: number; y: number };
  connections?: string[]; // IDs of connected nodes
}
```

### 3.2 Code Generator

**⚠️ ISOLATION**: Create in `src/lib/agent-builder/codegen.ts`:

**`src/lib/agent-builder/codegen.ts`:**

```typescript
export function generateAgentCode(definition: AgentDefinition): string {
  // Generate TypeScript code from visual definition
  // Outputs code compatible with @r1x/agent-runtime
  
  const contexts = definition.contexts.map(generateContextCode).join('\n\n');
  const actions = definition.actions.map(generateActionCode).join('\n\n');
  const entrypoints = generateEntrypoints(definition);
  
  return `
import { createAgentApp } from '@r1x/agent-runtime';
import { z } from 'zod';

${contexts}

${actions}

const { app, addEntrypoint } = createAgentApp({
  name: '${definition.name}',
  version: '1.0.0',
  description: '${definition.description}',
  ownerAddress: '${definition.ownerAddress}',
  network: '${definition.network}',
  x402Config: ${JSON.stringify(definition.x402Config)},
});

${entrypoints}

export default app;
`;
}
```

---

## Phase 4: Frontend Integration

### 4.1 Update AgentCanvas Component

**⚠️ ISOLATION**: Only add new functionality, don't remove existing UI code.

Add save/deploy functionality to existing `src/components/agent-builder/AgentCanvas.tsx`:

```typescript
// src/components/agent-builder/AgentCanvas.tsx
// ADD these imports and functions, keep all existing code

'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
// ... existing imports ...

export default function AgentCanvas() {
  // ... existing state and code ...
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { address: evmAddress } = useAccount();
  const { publicKey: solanaAddress } = useWallet();
  
  const saveAgent = async () => {
    setIsSaving(true);
    try {
      const definition = {
        contexts: extractContexts(nodes),
        actions: extractActions(nodes),
        workflow: nodes,
        x402Config: {
          enabled: true,
          maxPaymentAmount: '100',
          autoApprove: false,
        },
      };
      
      const response = await fetch('/api/agent-builder/agents', {
        method: agentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId || generateAgentId(),
          name: 'My Agent',
          definition,
          ownerAddress: evmAddress || solanaAddress?.toString(),
          network: evmAddress ? 'base' : 'solana',
        }),
      });
      
      const data = await response.json();
      setAgentId(data.agentId);
    } finally {
      setIsSaving(false);
    }
  };
  
  const deployAgent = async () => {
    if (!agentId) return;
    
    const response = await fetch(`/api/agent-builder/agents/${agentId}/deploy`, {
      method: 'POST',
    });
    
    const data = await response.json();
    // Show deployment success, display endpoint URL
  };
  
  return (
    <div>
      {/* ALL EXISTING UI CODE STAYS THE SAME */}
      {/* Only add save/deploy buttons at the end */}
      <div className="mt-6 flex gap-3">
        <button onClick={saveAgent} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Agent'}
        </button>
        {agentId && (
          <button onClick={deployAgent}>Deploy Agent</button>
        )}
      </div>
    </div>
  );
}
```

### 4.2 Update ContextBuilder & ActionBuilder

**⚠️ ISOLATION**: Only add functionality, preserve all existing UI.

Add form functionality to existing components:

```typescript
// src/components/agent-builder/ContextBuilder.tsx
// ADD state management and API calls, keep all existing UI

export default function ContextBuilder() {
  // ... existing code ...
  const [contexts, setContexts] = useState<Context[]>([]);
  
  const addContext = () => {
    // Add new context to agent definition
    // Save to agent via API
  };
  
  return (
    <div>
      {/* ALL EXISTING UI CODE STAYS */}
      {/* Only add form inputs at the end if needed */}
    </div>
  );
}
```

---

## Phase 5: Deployment Service

### 5.1 Runtime Deployment Options

**Option A: Serverless Functions (Vercel/Netlify)**
- Generate serverless function code
- Deploy via API
- Return endpoint URL

**Option B: Railway Service**
- Create new Railway service per agent
- Deploy Docker container
- Return endpoint URL

**Option C: Edge Runtime (Cloudflare Workers)**
- Generate edge-compatible code
- Deploy to Cloudflare
- Return endpoint URL

**Recommended: Option A (Serverless) for MVP**

### 5.2 Deployment API

**⚠️ ISOLATION**: Create new route file, don't modify existing routes.

**`POST /api/agent-builder/agents/[agentId]/deploy`:**

Create `src/app/api/agent-builder/agents/[agentId]/deploy/route.ts`:

```typescript
// src/app/api/agent-builder/agents/[agentId]/deploy/route.ts
// NEW FILE - completely isolated

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAgentCode } from '@/lib/agent-builder/codegen';
import { deployToRuntime } from '@/lib/agent-builder/deployment';

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  // Use existing prisma instance (no modifications)
  const agent = await prisma.agent.findUnique({
    where: { agentId: params.agentId },
  });
  
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  
  // Generate code using isolated codegen
  const code = generateAgentCode(agent.definition);
  
  // Deploy to runtime (e.g., Vercel serverless function)
  const endpoint = await deployToRuntime({
    agentId: params.agentId,
    code,
    network: agent.network,
  });
  
  // Update agent (new model, no conflicts)
  await prisma.agent.update({
    where: { agentId: params.agentId },
    data: {
      deployed: true,
      deployedAt: new Date(),
      endpoint,
    },
  });
  
  return NextResponse.json({ endpoint, deployed: true });
}
```

---

## Phase 6: ERC-8004 Identity (Optional, Lucid-inspired)

### 6.1 Agent Identity Registration

Inspired by `@lucid-agents/agent-kit-identity`:

```typescript
// src/lib/agent-identity.ts
import { createAgentIdentity, getTrustConfig } from '@lucid-agents/agent-kit-identity';

export async function registerAgentIdentity(agentId: string, domain: string) {
  const identity = await createAgentIdentity({
    domain: `${agentId}.r1xlabs.com`,
    autoRegister: true,
  });
  
  const trustConfig = getTrustConfig(identity);
  
  // Save to database
  await prisma.agent.update({
    where: { agentId },
    data: {
      identityAddress: identity.address,
      trustConfig,
    },
  });
  
  return identity;
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Add `Agent` and `AgentExecution` models to Prisma schema (append only, no modifications)
- [ ] Run migration
- [ ] Create `/api/agent-builder/agents` CRUD endpoints (new directory)
- [ ] Add wallet authentication middleware (isolated, new file)
- [ ] Test API with Postman/curl

### Phase 2: Runtime Engine (Week 2-3)
- [ ] Create `src/lib/agent-builder/runtime/` directory (isolated)
- [ ] Implement `createAgentApp` (lucid-inspired)
- [ ] Implement context system (Dreams-inspired)
- [ ] Implement action system
- [ ] Create x402 wrapper (no modifications to existing client)
- [ ] Write unit tests (isolated test files)

### Phase 3: Code Generation (Week 3-4)
- [ ] Create `src/lib/agent-builder/codegen.ts` (isolated)
- [ ] Generate TypeScript code compatible with runtime
- [ ] Test code generation with sample agents
- [ ] Add validation for generated code

### Phase 4: Frontend Integration (Week 4-5)
- [ ] Add save/load state to AgentCanvas (preserve existing UI)
- [ ] Add API integration to ContextBuilder (preserve existing UI)
- [ ] Add API integration to ActionBuilder (preserve existing UI)
- [ ] Add "Save Agent" button (new, doesn't remove existing)
- [ ] Add "Deploy Agent" button (new, doesn't remove existing)
- [ ] Show deployment status (new UI element)

### Phase 5: Deployment (Week 5-6)
- [ ] Choose deployment platform (Vercel recommended)
- [ ] Implement deployment API
- [ ] Test agent deployment
- [ ] Add endpoint URL display
- [ ] Add execution testing UI

### Phase 6: Polish & Testing (Week 6-7)
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Documentation
- [ ] User feedback collection

---

## Dependencies to Add

**⚠️ ISOLATION**: Only add if needed, don't modify existing dependencies.

```json
{
  "dependencies": {
    "zod": "^3.22.0" // Already have it - no changes needed
    // Add only if needed for agent builder:
    // "hono": "^3.11.0" // For runtime (if using Hono like lucid-agents)
  }
}
```

**Note**: 
- We already have `zod` - no changes needed
- We may not need to install lucid-agents packages directly
- Instead, we'll implement similar patterns adapted for r1x's needs
- All new code will be isolated in `src/lib/agent-builder/` and `src/app/api/agent-builder/`

---

## Key Differences from Lucid Agents

1. **Visual Builder**: r1x has a visual workflow builder (lucid-agents is code-first)
2. **Multi-chain**: r1x supports Base + Solana (lucid-agents is EVM-focused)
3. **Marketplace Integration**: r1x has built-in marketplace discovery
4. **Deployment**: r1x handles deployment automatically (lucid-agents expects manual deployment)

---

## Next Steps

1. **Review this plan** - Confirm approach aligns with vision
2. **Start Phase 1** - Database schema (append only) and API routes (new directory)
3. **Iterate** - Build incrementally, test frequently
4. **Maintain isolation** - Every change must be in agent-builder specific directories

---

## File Structure Summary (All New/Isolated)

```
prisma/
  schema.prisma                    # APPEND Agent models only

src/
  app/
    api/
      agent-builder/               # NEW - isolated API routes
        agents/
          route.ts                 # GET, POST
          [agentId]/
            route.ts               # GET, PUT, DELETE
            deploy/
              route.ts             # POST deploy
            execute/
              route.ts             # POST execute
  
  lib/
    agent-builder/                 # NEW - isolated agent builder libs
      runtime/
        index.ts
        agent.ts
        entrypoint.ts
        context.ts
        action.ts
        x402-wrapper.ts            # Wrapper, not modification
      codegen.ts
      deployment.ts
      types.ts
  
  components/
    agent-builder/
      AgentCanvas.tsx              # ADD functionality, keep existing UI
      ContextBuilder.tsx           # ADD functionality, keep existing UI
      ActionBuilder.tsx            # ADD functionality, keep existing UI
      # ... existing components stay as-is ...
```

**Key Points:**
- ✅ All new files
- ✅ No modifications to existing files
- ✅ Separate API prefix (`/api/agent-builder/`)
- ✅ Separate lib directory (`src/lib/agent-builder/`)
- ✅ Database changes are additive only

---

## References

- [Lucid Agents GitHub](https://github.com/daydreamsai/lucid-agents)
- [Lucid Agents Agent Kit](https://github.com/daydreamsai/lucid-agents/tree/master/packages/agent-kit)
- [ERC-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [x402 Protocol Docs](https://docs.payai.network/x402/reference)

