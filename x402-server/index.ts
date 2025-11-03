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
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4021;

if (!facilitatorUrl || !payTo) {
  console.error('Missing required environment variables: FACILITATOR_URL or MERCHANT_ADDRESS');
  process.exit(1);
}

const app = express();

// CORS configuration - Allow requests from Next.js frontend
const allowedOrigins = [
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://www.r1xlabs.com',
  'https://r1xlabs.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches r1xlabs.com domain
    if (
      allowedOrigins.includes(origin) || 
      origin.includes('railway.app') ||
      origin.includes('r1xlabs.com')
    ) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, true); // Allow all for now, adjust in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Payment', 'Authorization', 'Accept'],
}));

app.use(express.json());

app.use(
  paymentMiddleware(
    payTo,
    {
      'POST /api/r1x-agent/chat': {
        // USDC amount in dollars
        price: '$0.25',
        network: 'base', // Base mainnet
      },
      'POST /api/x402/pay': {
        price: '$0.01',
        network: 'base',
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);

// Routes réelles - le middleware vérifie le paiement avant d'arriver ici
app.post('/api/r1x-agent/chat', async (req, res) => {
  // Le paiement est déjà vérifié par le middleware PayAI
  // On peut maintenant traiter la requête chat
  try {
    console.log('[x402-server] Chat request received:', {
      hasMessages: !!req.body.messages,
      messageCount: req.body.messages?.length || 0,
      hasPayment: !!req.headers['x-payment'],
    });

    // Import Anthropic depuis le chemin relatif ou via API
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      console.error('[x402-server] ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      console.error('[x402-server] Invalid messages format:', req.body);
      return res.status(400).json({ error: 'Invalid messages format' });
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
      res.json({ message: content.text });
    } else {
      console.error('[x402-server] Unexpected response format:', content);
      res.status(500).json({ error: 'Unexpected response format' });
    }
  } catch (error: any) {
    console.error('[x402-server] Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

app.post('/api/x402/pay', async (req, res) => {
  // Le paiement est déjà vérifié par le middleware PayAI
  // On peut maintenant donner accès au service
  console.log('[x402-server] Payment verified, granting access:', {
    serviceId: req.body.serviceId,
    hasPayment: !!req.headers['x-payment'],
  });
  
  res.json({ 
    success: true,
    message: 'Payment verified, service access granted',
    data: req.body,
  });
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
