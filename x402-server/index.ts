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
  },
  facilitatorConfig,
));

// Error handler middleware to catch payment middleware errors
// Must be AFTER paymentMiddleware but BEFORE route handlers
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Express Error Handler] Payment middleware error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    hasPayment: !!req.headers['x-payment'],
  });
  
  // If headers already sent, just log and return
  if (res.headersSent) {
    console.error('[Express Error Handler] Headers already sent, cannot send error response');
    return;
  }
  
  // Send error response
  res.status(500).json({
    error: 'Payment processing error',
    message: err.message || 'An error occurred during payment processing',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
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

    // Log minimal detail about X-Payment header for diagnostics (length only)
    const xPaymentHeader = typeof req.headers['x-payment'] === 'string' ? req.headers['x-payment'] as string : undefined;
    if (xPaymentHeader) {
      console.log('[x402-server] X-Payment header present, length:', xPaymentHeader.length);
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

    // Appel direct à Anthropic API
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'x402-express',
    facilitator: facilitatorUrl,
    merchant: payTo,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}`);
  console.log(`Facilitator: ${facilitatorUrl}`);
  console.log(`Merchant: ${payTo}`);
});
