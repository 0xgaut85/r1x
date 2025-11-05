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

  // Override status to track the status code
  res.status = function (code: number) {
    statusCode = code;
    return originalStatus(code);
  };

  // Override json to transform 402 responses
  res.json = function (body: any) {
    if (statusCode === 402 || res.statusCode === 402) {
      const transformed = transformToX402scanFormat(body, req);
      console.log('[x402scan] Transforming 402 response to x402scan format');
      return originalJson(transformed);
    }
    return originalJson(body);
  };

  // Override send to transform 402 responses
  res.send = function (body: any) {
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
      console.log('[x402scan] Transforming 402 response to x402scan format');
      return originalSend(JSON.stringify(transformed));
    }
    return originalSend(body);
  };

  next();
}

/**
 * Transform PayAI 402 response to x402scan format
 */
function transformToX402scanFormat(payaiResponse: any, req: Request): X402scanResponse {
  // Extract payment info from PayAI response
  // PayAI might return different formats, so we need to handle multiple cases
  
  const resource = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const merchantAddress = process.env.MERCHANT_ADDRESS || '';
  const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  
  // Determine amount - PayAI might return it in different formats
  let maxAmountRequired = '250000'; // Default: 0.25 USDC (6 decimals)
  let description = 'r1x Agent Chat - AI Assistant';
  
  // Parse amount from various possible PayAI response formats
  if (payaiResponse.accepts && Array.isArray(payaiResponse.accepts) && payaiResponse.accepts[0]) {
    // Already in accepts format, extract amount
    maxAmountRequired = payaiResponse.accepts[0].maxAmountRequired || maxAmountRequired;
    description = payaiResponse.accepts[0].description || description;
  } else if (payaiResponse.payment) {
    // PayAI format with payment object
    if (payaiResponse.payment.amountRaw) {
      maxAmountRequired = payaiResponse.payment.amountRaw.toString();
    } else if (payaiResponse.payment.amount) {
      // Parse from "$0.25" format
      const amountStr = payaiResponse.payment.amount.replace('$', '');
      maxAmountRequired = (parseFloat(amountStr) * 1e6).toString();
    }
  } else if (payaiResponse.error && payaiResponse.error.includes('0.25')) {
    // Try to extract from error message
    maxAmountRequired = '250000';
  }

  // Determine the route to set appropriate outputSchema
  const isChatRoute = req.originalUrl.includes('/api/r1x-agent/chat');
  
  // Build x402scan-compliant response
  const x402scanResponse: X402scanResponse = {
    x402Version: 1,
    error: payaiResponse.error || 'Payment Required',
    accepts: [
      {
        scheme: 'exact',
        network: 'base',
        maxAmountRequired: maxAmountRequired,
        resource: resource,
        description: description,
        mimeType: 'application/json',
        payTo: merchantAddress,
        maxTimeoutSeconds: 3600, // 1 hour
        asset: USDC_BASE,
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
          serviceId: isChatRoute ? 'r1x-agent-chat' : 'r1x-x402-pay',
          serviceName: isChatRoute ? 'r1x Agent Chat' : 'r1x Payment',
          price: isChatRoute ? '$0.25' : '$0.01',
        },
      },
    ],
  };

  return x402scanResponse;
}

