/**
 * Transform PayAI middleware 402 response to x402scan schema format
 * 
 * x402scan requires a stricter schema than the default x402 schema:
 * - x402Version: number
 * - accepts: Array with specific fields (scheme, resource, description, mimeType, etc.)
 */

import { Request, Response, NextFunction } from 'express';

export interface X402scanAccepts {
  scheme: 'exact';
  network: 'base';
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  outputSchema?: {
    input: {
      type: 'http';
      method: 'GET' | 'POST';
      bodyType?: 'json' | 'form-data' | 'multipart-form-data' | 'text' | 'binary';
      queryParams?: Record<string, any>;
      bodyFields?: Record<string, any>;
      headerFields?: Record<string, any>;
    };
    output?: Record<string, any>;
  };
  extra?: Record<string, any>;
}

export interface X402scanResponse {
  x402Version: number;
  error?: string;
  accepts?: X402scanAccepts[];
  payer?: string;
}

/**
 * Middleware to transform 402 responses to x402scan format
 * Should be placed AFTER paymentMiddleware but BEFORE route handlers
 * 
 * PayAI middleware sends 402 responses directly, so we intercept all responses
 * and transform 402s to x402scan format
 */
export function x402scanResponseTransformer(req: Request, res: Response, next: NextFunction) {
  // Store original methods
  const originalJson = res.json.bind(res);
  const originalStatus = res.status.bind(res);
  const originalSend = res.send.bind(res);
  const originalEnd = res.end.bind(res);

  // Track status code
  let statusCode = 200;
  let responseBody: any = null;

  // Override status to track the status code
  res.status = function (code: number) {
    statusCode = code;
    res.statusCode = code;
    return originalStatus(code);
  };

  // Override json to transform 402 responses
  res.json = function (body: any) {
    responseBody = body;
    if (statusCode === 402 || res.statusCode === 402) {
      const transformed = transformToX402scanFormat(body, req);
      console.log('[x402scan] Transforming 402 response to x402scan format:', JSON.stringify(transformed, null, 2));
      return originalJson(transformed);
    }
    return originalJson(body);
  };

  // Override send to transform 402 responses
  res.send = function (body: any) {
    responseBody = body;
    if (statusCode === 402 || res.statusCode === 402) {
      let parsedBody = body;
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          // Not JSON, use as-is
        }
      }
      const transformed = transformToX402scanFormat(parsedBody, req);
      console.log('[x402scan] Transforming 402 response to x402scan format:', JSON.stringify(transformed, null, 2));
      return originalSend(JSON.stringify(transformed));
    }
    return originalSend(body);
  };

  // Override end to catch responses sent directly
  res.end = function (chunk?: any, encoding?: any) {
    if (statusCode === 402 || res.statusCode === 402) {
      let parsedBody = responseBody || chunk;
      if (typeof parsedBody === 'string') {
        try {
          parsedBody = JSON.parse(parsedBody);
        } catch {
          // Not JSON, transform empty/raw response
          parsedBody = {};
        }
      }
      const transformed = transformToX402scanFormat(parsedBody, req);
      console.log('[x402scan] Transforming 402 response (via end) to x402scan format:', JSON.stringify(transformed, null, 2));
      res.setHeader('Content-Type', 'application/json');
      return originalEnd(JSON.stringify(transformed), encoding);
    }
    return originalEnd(chunk, encoding);
  };

  next();
}

/**
 * Transform PayAI 402 response to x402scan format
 * Preserves original PayAI structure to ensure signature verification works
 */
function transformToX402scanFormat(payaiResponse: any, req: Request): X402scanResponse {
  // Extract payment info from PayAI response
  // PayAI might return different formats, so we need to handle multiple cases
  
  // CRITICAL: Preserve original resource from PayAI response for signature verification
  // The resource field is part of the signed payload, so it must match exactly
  const merchantAddress = process.env.MERCHANT_ADDRESS || '';
  const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  
  // Determine the route to set appropriate outputSchema
  const isChatRoute = req.originalUrl.includes('/api/r1x-agent/chat');
  
  // Start with original PayAI response structure if it exists
  let maxAmountRequired = '250000'; // Default: 0.25 USDC (6 decimals)
  let description = isChatRoute 
    ? 'From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.'
    : 'From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.';
  let payTo = merchantAddress;
  let asset = USDC_BASE;
  let scheme = 'exact';
  let network = 'base';
  let resource = `${req.protocol}://${req.get('host')}${req.originalUrl}`; // Fallback
  
  // Extract from PayAI response if it exists (preserve original structure)
  if (payaiResponse.accepts && Array.isArray(payaiResponse.accepts) && payaiResponse.accepts[0]) {
    const originalAccept = payaiResponse.accepts[0];
    // Preserve original PayAI fields for signature verification
    // CRITICAL: resource must match exactly what PayAI generated
    resource = originalAccept.resource || resource;
    maxAmountRequired = originalAccept.maxAmountRequired || maxAmountRequired;
    description = originalAccept.description || description;
    payTo = originalAccept.payTo || payTo;
    asset = originalAccept.asset || asset;
    scheme = originalAccept.scheme || scheme;
    network = originalAccept.network || network;
  } else if (payaiResponse.payment) {
    // PayAI format with payment object
    if (payaiResponse.payment.amountRaw) {
      maxAmountRequired = payaiResponse.payment.amountRaw.toString();
    } else if (payaiResponse.payment.amount) {
      // Parse from "$0.25" format
      const amountStr = payaiResponse.payment.amount.replace('$', '');
      maxAmountRequired = (parseFloat(amountStr) * 1e6).toString();
    }
    payTo = payaiResponse.payment.payTo || payTo;
    asset = payaiResponse.payment.asset || asset;
  } else if (payaiResponse.error && payaiResponse.error.includes('0.25')) {
    // Try to extract from error message
    maxAmountRequired = '250000';
  }
  
  // Build x402scan-compliant response, preserving PayAI structure
  const x402scanResponse: X402scanResponse = {
    x402Version: payaiResponse.x402Version || 1,
    error: payaiResponse.error || 'Payment Required',
    accepts: [
      {
        scheme: scheme as 'exact',
        network: network as 'base',
        maxAmountRequired: maxAmountRequired,
        resource: resource,
        description: description,
        mimeType: payaiResponse.accepts?.[0]?.mimeType || 'application/json',
        payTo: payTo,
        maxTimeoutSeconds: payaiResponse.accepts?.[0]?.maxTimeoutSeconds || 3600,
        asset: asset,
        ...(isChatRoute ? {
          outputSchema: {
            input: {
              type: 'http',
              method: 'POST',
              bodyType: 'json',
              bodyFields: {
                messages: {
                  type: 'array',
                  required: true,
                  description: 'Array of chat messages',
                  properties: {
                    role: {
                      type: 'string',
                      required: true,
                      enum: ['user', 'assistant'],
                      description: 'Message role',
                    },
                    content: {
                      type: 'string',
                      required: true,
                      description: 'Message content',
                    },
                  },
                },
              },
            },
            output: {
              message: {
                type: 'string',
                description: 'AI assistant response',
              },
            },
          },
        } : {}),
        extra: {
          // Service identification
          serviceId: isChatRoute ? 'r1x-agent-chat' : 'r1x-x402-pay',
          serviceName: isChatRoute ? 'r1x Agent Chat' : 'r1x Payment',
          price: isChatRoute ? '$0.25' : '$0.01',
          
          // Provider metadata (for x402scan display)
          name: 'r1x Labs',
          provider: 'r1x Labs',
          providerName: 'r1x Labs',
          description: 'From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.',
          
          // Logo and branding (x402scan looks for these fields)
          logo: 'https://www.r1xlabs.com/logosvg.svg',
          logoUrl: 'https://www.r1xlabs.com/logosvg.svg',
          image: 'https://www.r1xlabs.com/logosvg.svg',
          icon: 'https://www.r1xlabs.com/logosvg.svg',
          
          // Website and links
          website: 'https://www.r1xlabs.com',
          websiteUrl: 'https://www.r1xlabs.com',
          url: 'https://www.r1xlabs.com',
          
          // Service metadata
          category: isChatRoute ? 'AI' : 'Payment',
          network: 'base',
          chainId: 8453,
          token: 'USDC',
          tokenAddress: USDC_BASE,
          tokenSymbol: 'USDC',
        },
      },
    ],
  };

  return x402scanResponse;
}

