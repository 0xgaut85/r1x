/**
 * PayAI x402 Express Server
 * 
 * Server suivant exactement la documentation PayAI
 * https://docs.payai.network/x402/servers/typescript/express
 */

import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { paymentMiddleware, Resource } from 'x402-express';
import Anthropic from '@anthropic-ai/sdk';
import { parsePaymentProof, saveTransaction } from './save-transaction';
import { x402scanResponseTransformer } from './x402scan-response';

config();

const facilitatorUrl = (process.env.FACILITATOR_URL || 'https://facilitator.payai.network') as Resource;
const payTo = process.env.MERCHANT_ADDRESS as `0x${string}`;
const cdpApiKeyId = process.env.CDP_API_KEY_ID;
const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4021;

if (!facilitatorUrl || !payTo) {
  console.error('Missing required environment variables: FACILITATOR_URL or MERCHANT_ADDRESS');
  process.exit(1);
}

const app = express();

// Behind Railway/Proxies: trust proxy so protocol/host are correct for x402 resource
app.set('trust proxy', true);

// CORS configuration - Allow requests from Next.js frontend
// IMPORTANT: CORS must be configured BEFORE paymentMiddleware to handle OPTIONS preflight
const allowedOrigins = [
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://www.r1xlabs.com',
  'https://r1xlabs.com',
  'https://api.r1xlabs.com', // Allow API subdomain
].filter(Boolean);

// Handle CORS with explicit OPTIONS support
app.use((req, res, next) => {
  const origin = req.headers.origin;
    
  // More permissive CORS for production - allow any r1xlabs.com subdomain
  const isAllowed = !origin || 
      allowedOrigins.includes(origin) || 
      origin.includes('railway.app') ||
    origin.includes('r1xlabs.com') ||
    origin.includes('vercel.app') ||
    (process.env.NODE_ENV === 'production' && origin && origin.includes('r1xlabs.com'));
  
  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('[CORS] Allowing origin:', origin);
  } else if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
    console.warn('[CORS] Blocked origin:', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS preflight request from:', origin);
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// DISABLED: x402scan transformer - following PayAI docs exactly
// app.use(x402scanResponseTransformer);

// Explicit OPTIONS handlers for all protected routes (must be before paymentMiddleware)
app.options('/api/r1x-agent/chat', (req, res) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('r1xlabs.com') || origin.includes('railway.app') || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  console.log('[CORS] OPTIONS /api/r1x-agent/chat from:', origin);
  res.status(200).end();
});

app.options('/api/x402/pay', (req, res) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('r1xlabs.com') || origin.includes('railway.app') || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  console.log('[CORS] OPTIONS /api/x402/pay from:', origin);
  res.status(200).end();
});

app.options('/api/r1x-agent/plan', (req, res) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('r1xlabs.com') || origin.includes('railway.app') || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payment, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  console.log('[CORS] OPTIONS /api/r1x-agent/plan from:', origin);
  res.status(200).end();
});

const facilitatorConfig: Parameters<typeof paymentMiddleware>[2] = {
  url: facilitatorUrl,
};

if (cdpApiKeyId && cdpApiKeySecret) {
  facilitatorConfig.createAuthHeaders = async () => {
    const basicAuth = Buffer.from(`${cdpApiKeyId}:${cdpApiKeySecret}`).toString('base64');
    const header = { Authorization: `Basic ${basicAuth}` };
    return {
      verify: header,
      settle: header,
      supported: header,
      list: header,
    };
  };
  console.log('[x402-server] Facilitator authentication configured with CDP API keys');
} else {
  console.warn('[x402-server] CDP_API_KEY_ID or CDP_API_KEY_SECRET missing - facilitator requests may fail on Base mainnet');
}

app.use(paymentMiddleware(
  payTo,
  {
    'POST /api/r1x-agent/chat': {
      price: '$0.25',
      network: 'base',
    },
    'POST /api/x402/pay': {
      price: '$0.01',
      network: 'base',
    },
    'POST /api/r1x-agent/plan': {
      price: '$0.01',
      network: 'base',
    },
  },
  facilitatorConfig,
));

// Error handler - only catches errors that middleware doesn't handle
// Payment middleware handles settlement errors internally, but may throw if something goes wrong
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // If headers already sent, middleware already handled the error
  if (res.headersSent) {
    console.error('[Express] Error after response sent (likely async settlement error):', err.message);
    return;
  }
  
  // Log the error for debugging
  console.error('[Express] Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });
  
  // Only send response if middleware didn't already handle it
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
  }
});

// Routes réelles - le middleware vérifie le paiement avant d'arriver ici
app.post('/api/r1x-agent/chat', async (req, res) => {
  // Le paiement est déjà vérifié par le middleware PayAI
  // Si le middleware a déjà envoyé une réponse (erreur de settlement, etc.), on ne fait rien
  if (res.headersSent) {
    console.log('[x402-server] Response already sent by middleware, skipping route handler');
    return;
  }

  // On peut maintenant traiter la requête chat
  try {
    console.log('[x402-server] Chat request received:', {
      hasMessages: !!req.body.messages,
      messageCount: req.body.messages?.length || 0,
      hasPayment: !!req.headers['x-payment'],
    });

    // Parse and save transaction to database (non-blocking, with timeout)
    const xPaymentHeader = typeof req.headers['x-payment'] === 'string' ? req.headers['x-payment'] as string : undefined;
    if (xPaymentHeader) {
      console.log('[x402-server] X-Payment header present, saving transaction...');
      const paymentProof = parsePaymentProof(xPaymentHeader);
      
      if (paymentProof) {
        // Save transaction asynchronously (don't wait for it)
        // Wrap in Promise.race with timeout to prevent hanging
        Promise.race([
          saveTransaction({
            proof: paymentProof,
            serviceId: 'r1x-agent-chat',
            serviceName: 'r1x Agent Chat',
            price: '0.25', // $0.25 per message
            feePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5'),
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction save timeout (5s)')), 5000)
          ),
        ]).catch((error) => {
          console.error('[x402-server] Failed to save transaction (non-blocking):', {
            message: error?.message || String(error),
            // Don't log full stack in production
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
          });
        });
      } else {
        console.warn('[x402-server] Could not parse payment proof from X-Payment header');
      }
    }

    // Import Anthropic depuis le chemin relatif ou via API
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      console.error('[x402-server] ANTHROPIC_API_KEY not configured');
      if (!res.headersSent) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
      }
      return;
    }

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      console.error('[x402-server] Invalid messages format:', req.body);
      if (!res.headersSent) {
      return res.status(400).json({ error: 'Invalid messages format' });
      }
      return;
    }

    // Fetch real marketplace services to include in system prompt
    // Fetch from database AND PayAI facilitator (same as marketplace API)
    let availableServices: any[] = [];
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const { formatUnits } = await import('viem');
      
      // Fetch database services
      const dbServices = await prisma.service.findMany({
        where: {
          available: true,
          network: 'base',
          chainId: 8453,
        },
        select: {
          serviceId: true,
          name: true,
          description: true,
          category: true,
          priceDisplay: true,
          endpoint: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limit to 50 most recent services
      });
      
      // Format database services
      const dbServicesFormatted = dbServices.map(s => ({
        id: s.serviceId,
        name: s.name,
        description: s.description || '',
        category: s.category || 'Other',
        price: s.priceDisplay,
        endpoint: s.endpoint || null,
      }));
      
      // Fetch PayAI services in real-time (same as marketplace API)
      let payaiServices: any[] = [];
      try {
        const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
        const url = `${facilitatorUrl}/list`;
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
        
        const cdpApiKeyId = process.env.CDP_API_KEY_ID;
        const cdpApiKeySecret = process.env.CDP_API_KEY_SECRET;
        
        if (cdpApiKeyId && cdpApiKeySecret) {
          const auth = Buffer.from(`${cdpApiKeyId}:${cdpApiKeySecret}`).toString('base64');
          headers['Authorization'] = `Basic ${auth}`;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(10000),
        });
        
        if (response.ok) {
          const data = await response.json() as any;
          let services: any[] = [];
          
          if (Array.isArray(data)) {
            services = data;
          } else if (data?.resources && Array.isArray(data.resources)) {
            services = data.resources;
          } else if (data?.list && Array.isArray(data.list)) {
            services = data.list;
          }
          
          if (services.length > 0) {
            payaiServices = services.map((s: any) => {
              const accept = s.accepts?.[0] || {};
              const decimals = accept.extra?.tokenSymbol === 'USDC' || s.tokenSymbol === 'USDC' ? 6 : 18;
              const priceWei = accept.maxAmountRequired || s.price || '0';
              const price = formatUnits(BigInt(priceWei), decimals);
              const priceWithFee = (parseFloat(price) * 1.05).toFixed(6); // 5% platform fee
              
              return {
                id: s.resource || s.id || `payai-${Math.random()}`,
                name: accept.description || s.metadata?.name || s.name || 'PayAI Service',
                description: accept.description || s.description || '',
                category: extractCategory(accept.description || s.name, s.description) || 'Other',
                price: priceWithFee, // Price with fee
                endpoint: s.resource || s.endpoint || null,
              };
            });
          }
        }
      } catch (payaiError) {
        console.error('[x402-server] Error fetching PayAI services for system prompt:', payaiError);
        // Continue with database services only
      }
      
      // Combine services (database first, then PayAI)
      // Remove duplicates by ID
      const servicesMap = new Map<string, any>();
      dbServicesFormatted.forEach(s => servicesMap.set(s.id, s));
      payaiServices.forEach(s => {
        if (!servicesMap.has(s.id)) {
          servicesMap.set(s.id, s);
        }
      });
      
      availableServices = Array.from(servicesMap.values()).slice(0, 50);
      
      await prisma.$disconnect();
      console.log(`[x402-server] Loaded ${availableServices.length} services for system prompt (${dbServicesFormatted.length} from DB, ${payaiServices.length} from PayAI)`);
    } catch (error) {
      console.error('[x402-server] Error fetching services for system prompt:', error);
      // Continue without services - Claude will still work
    }

    // Appel direct à Anthropic API
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    
    // Build services list for system prompt
    const servicesList = availableServices.length > 0
      ? `\n\nAvailable Marketplace Services (use these when users ask about services):\n${availableServices.map((s, i) => 
          `${i + 1}. ${s.name} (${s.category}) - ${s.price} USDC${s.endpoint ? ` - Endpoint: ${s.endpoint}` : ' - No direct endpoint'}\n   ${s.description || 'No description'}`
        ).join('\n')}`
      : '\n\nNote: No marketplace services are currently available. When users ask about services, let them know the marketplace is being populated.';

    // System prompt to make Claude act as r1x Agent
    const systemPrompt = `You are r1x Agent, an AI assistant for r1x Labs, specializing in the machine economy and x402 payment protocol.

About r1x:
- r1x Labs enables autonomous machine-to-machine transactions
- r1x is "Humanity's first blind computer" - decentralizing trust for sensitive data
- r1x operates on Base network (Base blockchain, chainId: 8453)
- r1x provides infrastructure for AI agents and robots to transact autonomously

About x402:
- x402 is an HTTP payment protocol (HTTP 402 Payment Required)
- Payments are made in USDC on Base network
- PayAI facilitator handles payment verification and settlement
- x402 enables pay-per-use access to APIs, AI services, compute resources, etc.

About r1x Marketplace:
- Platform for discovering and accessing x402 services
- Services include AI inference, data streams, compute resources, digital content, robot services, tokens & NFTs, mints
- 5% platform fee on external services
- Services are automatically refreshed every 60 seconds

Your capabilities:
- Answer questions about r1x infrastructure, x402 protocol, and the machine economy
- Guide developers on integrating r1x SDK and building on Base
- When users ask to purchase services (e.g., "mint a token", "use an AI service", "buy compute"), you can autonomously find and purchase the best matching service from the marketplace
- You understand user intent and can propose relevant services, then execute purchases automatically using x402 payments
- All purchases happen via wallet signature - users only need to approve the transaction

Your role:
- Help users understand r1x infrastructure and the machine economy
- Answer questions about x402 payment protocol and PayAI integration
- Guide developers on integrating r1x SDK and building on Base
- Explain how r1x enables autonomous machine-to-machine transactions
- When users request services, autonomously find and purchase them from the marketplace
- Provide accurate, helpful information about r1x Labs, Base network, and x402 ecosystem

Always respond as r1x Agent with expertise in r1x and x402. Be helpful, accurate, and enthusiastic about the machine economy.

IMPORTANT - Service References:
- When users ask about services or want to purchase something, ONLY mention services from the "Available Marketplace Services" list below
- Do NOT make up, invent, or hallucinate services that are not in the list
- If a user asks for a service that doesn't exist in the list, politely inform them that it's not currently available and suggest checking the marketplace for updates
- Always use the exact service names, prices, and descriptions from the list below${servicesList}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      system: systemPrompt,
      messages: req.body.messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    });

    const content = response.content[0];
    if (content.type === 'text') {
      console.log('[x402-server] Chat response sent successfully');
      if (!res.headersSent) {
      res.json({ message: content.text });
      }
    } else {
      console.error('[x402-server] Unexpected response format:', content);
      if (!res.headersSent) {
      res.status(500).json({ error: 'Unexpected response format' });
      }
    }
  } catch (error: any) {
    console.error('[x402-server] Chat error:', error);
    // Ne pas envoyer de réponse si le middleware l'a déjà fait
    if (!res.headersSent) {
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    }
  }
});

app.post('/api/x402/pay', async (req, res) => {
  // Le paiement est déjà vérifié par le middleware PayAI
  // Si le middleware a déjà envoyé une réponse (erreur de settlement, etc.), on ne fait rien
  if (res.headersSent) {
    console.log('[x402-server] Response already sent by middleware, skipping route handler');
    return;
  }

  // Parse and save transaction to database (non-blocking, with timeout)
  const xPaymentHeader = typeof req.headers['x-payment'] === 'string' ? req.headers['x-payment'] as string : undefined;
  if (xPaymentHeader) {
    console.log('[x402-server] Payment verified, saving transaction...');
    const paymentProof = parsePaymentProof(xPaymentHeader);
    
    if (paymentProof) {
      const serviceId = req.body.serviceId || 'unknown-service';
      const serviceName = req.body.serviceName || 'Unknown Service';
      const totalPrice = req.body.price || '0.01'; // Total price paid (includes fee for external services)
      const basePrice = req.body.basePrice || totalPrice; // Base price before fee (for external services)
      const isExternal = req.body.isExternal === true;
      
      // For external services, fee is calculated on base price, not total price
      // For our services, fee is calculated on total price (we receive full amount)
      const priceForFeeCalculation = isExternal ? basePrice : totalPrice;
      
      // Wrap in Promise.race with timeout to prevent hanging
      Promise.race([
        saveTransaction({
          proof: paymentProof,
          serviceId,
          serviceName,
          price: priceForFeeCalculation, // Use base price for external, total for our services
          feePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5'),
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction save timeout (5s)')), 5000)
        ),
      ]).catch((error) => {
        console.error('[x402-server] Failed to save transaction (non-blocking):', {
          message: error?.message || String(error),
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        });
      });
    }
  }

  // On peut maintenant donner accès au service
  console.log('[x402-server] Payment verified, granting access:', {
    serviceId: req.body.serviceId,
    hasPayment: !!req.headers['x-payment'],
  });
  
  if (!res.headersSent) {
  res.json({ 
    success: true,
    message: 'Payment verified, service access granted',
    data: req.body,
  });
  }
});

app.post('/api/r1x-agent/plan', async (req, res) => {
  // Le paiement est déjà vérifié par le middleware PayAI
  if (res.headersSent) {
    console.log('[x402-server] Response already sent by middleware, skipping route handler');
    return;
  }

  try {
    console.log('[x402-server] Plan request received:', {
      query: req.body.query,
      category: req.body.category,
      budgetMax: req.body.budgetMax,
    });

    // Parse and save transaction to database (non-blocking)
    const xPaymentHeader = typeof req.headers['x-payment'] === 'string' ? req.headers['x-payment'] as string : undefined;
    if (xPaymentHeader) {
      const paymentProof = parsePaymentProof(xPaymentHeader);
      if (paymentProof) {
        Promise.race([
          saveTransaction({
            proof: paymentProof,
            serviceId: 'r1x-agent-plan',
            serviceName: 'r1x Agent Plan',
            price: '0.01',
            feePercentage: parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5'),
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction save timeout (5s)')), 5000)
          ),
        ]).catch((error) => {
          console.error('[x402-server] Failed to save transaction (non-blocking):', error?.message);
        });
      }
    }

    // Fetch marketplace services from database only
    // PayAI services are synced to database via /api/sync/payai endpoint (same as marketplace)
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const query = req.body.query || '';
    const category = req.body.category;
    const budgetMax = req.body.budgetMax ? parseFloat(req.body.budgetMax) : undefined;
    const network = 'base';
    const chainId = 8453;

    // Build database query
    const where: any = {
      available: true,
      network,
      chainId,
    };

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // Fetch from database
    let dbServices = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Format database services (includes PayAI services synced via /api/sync/payai)
    // Same approach as marketplace - all services are in database
    const allServices = dbServices
      .filter(service => {
        const price = parseFloat(service.priceDisplay || '0');
        return !budgetMax || price <= budgetMax;
      })
      .map(service => ({
        serviceId: service.serviceId,
        name: service.name,
        category: service.category || 'Other',
        price: service.priceDisplay,
        merchant: service.merchant,
        network: service.network,
        chainId: service.chainId,
        resource: service.endpoint,
        schemaSummary: {
          method: 'POST',
          contentType: 'application/json',
        },
      }));

    // Rank: Base network first, then by price
    const ranked = allServices
      .filter(s => s.network === 'base' && (!s.chainId || s.chainId === chainId))
      .sort((a, b) => {
        const priceA = parseFloat(a.price || '999999');
        const priceB = parseFloat(b.price || '999999');
        return priceA - priceB;
      })
      .slice(0, 10); // Top 10 proposals

    await prisma.$disconnect();

    if (!res.headersSent) {
      res.json({
        proposals: ranked,
        total: ranked.length,
        query,
        category,
      });
    }
  } catch (error: any) {
    console.error('[x402-server] Plan error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
});

// Helper function to extract category
function extractCategory(name?: string, description?: string): string {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('api') || text.includes('claude') || text.includes('gpt') || text.includes('ai inference') || text.includes('llm') || text.includes('chat')) {
    return 'AI';
  }
  if (text.includes('data') || text.includes('feed') || text.includes('stream')) {
    return 'Data';
  }
  if (text.includes('compute') || text.includes('gpu') || text.includes('processing')) {
    return 'Compute';
  }
  if (text.includes('content') || text.includes('digital') || text.includes('asset')) {
    return 'Content';
  }
  if (text.includes('robot') || text.includes('agent') || text.includes('autonomous')) {
    return 'Robot Services';
  }
  if (text.includes('token') || text.includes('mint') || text.includes('nft')) {
    return 'Mint';
  }
  
  return 'Other';
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'x402-express',
    facilitator: facilitatorUrl,
    merchant: payTo,
  });
});

// Public API endpoints for x402scan
app.get('/api/panel/public/services', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const category = req.query.category as string | undefined;
    const network = (req.query.network as string) || 'base';
    const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : 8453;

    const where: any = {
      available: true,
      network,
      chainId,
    };

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        _count: {
          select: {
            transactions: {
              where: {
                status: { in: ['verified', 'settled'] },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const { formatUnits } = await import('viem');
    const USDC_DECIMALS = 6;

    const publicServices = services.map(service => ({
      id: service.serviceId,
      name: service.name,
      description: service.description,
      category: service.category || 'Other',
      merchant: service.merchant,
      network: service.network,
      chainId: service.chainId,
      token: service.token,
      tokenSymbol: service.tokenSymbol,
      price: service.priceDisplay,
      priceWei: service.price,
      endpoint: service.endpoint,
      totalPurchases: service._count.transactions,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    await prisma.$disconnect();
    
    res.json({
      services: publicServices,
      total: publicServices.length,
      network,
      chainId,
    });
  } catch (error: any) {
    console.error('[x402-server] Public services API error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred',
    });
  }
});

app.get('/api/discovery/resources', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const network = (req.query.network as string) || 'base';
    const chainId = req.query.chainId ? parseInt(req.query.chainId as string) : 8453;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.r1xlabs.com';
    const serverUrl = process.env.X402_SERVER_URL || 'https://server.r1xlabs.com';

    // Fetch marketplace services
    const dbServices = await prisma.service.findMany({
      where: {
        available: true,
        network,
        chainId,
      },
      include: {
        _count: {
          select: {
            transactions: {
              where: {
                status: { in: ['verified', 'settled'] },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format marketplace services
    const marketplaceResources = dbServices.map(service => ({
      id: service.serviceId,
      name: service.name,
      description: service.description,
      category: service.category || 'Other',
      resource: service.endpoint || `${serverUrl}/api/x402/pay`,
      method: 'POST',
      price: service.priceDisplay,
      priceWei: service.price,
      merchant: service.merchant,
      network: service.network,
      chainId: service.chainId,
      token: service.token,
      tokenSymbol: service.tokenSymbol,
      totalPurchases: service._count.transactions,
    }));

    // Add r1x Agent endpoints
    const agentResources = [
      {
        id: 'r1x-agent-chat',
        name: 'r1x Agent Chat',
        description: 'AI Agent chat service powered by Claude 3 Opus. Specialized in r1x infrastructure, x402 protocol, and machine economy.',
        category: 'AI',
        resource: `${serverUrl}/api/r1x-agent/chat`,
        resourceAlt: `${baseUrl}/api/r1x-agent/chat`,
        method: 'POST',
        price: '0.25',
        priceWei: '250000',
        merchant: payTo,
        network: 'base',
        chainId: 8453,
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        tokenSymbol: 'USDC',
      },
      {
        id: 'r1x-agent-plan',
        name: 'r1x Agent Plan',
        description: 'AI agent service discovery and planning. Get ranked proposals for marketplace services based on query and category.',
        category: 'Discovery',
        resource: `${serverUrl}/api/r1x-agent/plan`,
        resourceAlt: `${baseUrl}/api/r1x-agent/plan`,
        method: 'POST',
        price: '0.01',
        priceWei: '10000',
        merchant: payTo,
        network: 'base',
        chainId: 8453,
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        tokenSymbol: 'USDC',
      },
    ];

    const allResources = [...agentResources, ...marketplaceResources];

    await prisma.$disconnect();
    
    res.json({
      resources: allResources,
      total: allResources.length,
      agentResources: agentResources.length,
      marketplaceResources: marketplaceResources.length,
      network,
      chainId,
      version: '1.0',
    });
  } catch (error: any) {
    console.error('[x402-server] Discovery API error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred',
    });
  }
});

app.get('/api/panel/public/transactions', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const limit = parseInt((req.query.limit as string) || '100');
    const offset = parseInt((req.query.offset as string) || '0');
    const serviceId = req.query.serviceId as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {
      status: { in: ['verified', 'settled'] },
    };

    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { serviceId },
      });
      if (service) {
        where.serviceId = service.id;
      } else {
        await prisma.$disconnect();
        return res.json({
          transactions: [],
          pagination: { total: 0, limit, offset, hasMore: false },
        });
      }
    }

    if (status) {
      where.status = status;
    }

    const { formatUnits } = await import('viem');
    const USDC_DECIMALS = 6;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          service: {
            select: {
              serviceId: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    const publicTransactions = transactions.map(tx => {
      const explorerHash = tx.settlementHash || tx.transactionHash;
      const explorerUrl = explorerHash 
        ? `https://basescan.org/tx/${explorerHash}`
        : null;
      
      return {
        transactionHash: tx.transactionHash,
        settlementHash: tx.settlementHash,
        blockNumber: tx.blockNumber,
        service: {
          id: tx.service.serviceId,
          name: tx.service.name,
          category: tx.service.category,
        },
        amount: formatUnits(BigInt(tx.amount), USDC_DECIMALS),
        fee: formatUnits(BigInt(tx.feeAmount), USDC_DECIMALS),
        status: tx.status,
        timestamp: tx.timestamp,
        blockExplorerUrl: explorerUrl,
      };
    });

    await prisma.$disconnect();

    res.json({
      transactions: publicTransactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('[x402-server] Public transactions API error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
  console.log(`Facilitator: ${facilitatorUrl}`);
  console.log(`Merchant: ${payTo}`);
  
  // Check if DATABASE_URL is configured for transaction saving
  if (process.env.DATABASE_URL) {
    console.log('[x402-server] Transaction saving enabled (DATABASE_URL configured)');
  } else {
    console.warn('[x402-server] Transaction saving disabled (DATABASE_URL not set)');
  }
});

// Graceful shutdown - close database connections
process.on('SIGTERM', async () => {
  console.log('[x402-server] SIGTERM received, closing connections...');
  const { closeConnection } = await import('./save-transaction.js');
  await closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[x402-server] SIGINT received, closing connections...');
  const { closeConnection } = await import('./save-transaction.js');
  await closeConnection();
  process.exit(0);
});
