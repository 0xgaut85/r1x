/**
 * x402 Discovery Endpoint
 * 
 * GET /api/discovery/resources
 * Public endpoint for x402scan to discover all x402-protected resources
 * Includes both marketplace services and r1x agent endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.r1xlabs.com';
const SERVER_URL = process.env.X402_SERVER_URL || 'https://server.r1xlabs.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'base';
    const chainId = searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : 8453;

    // Fetch marketplace services from database
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
      resource: service.endpoint || `${SERVER_URL}/api/x402/pay`,
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

    // Add r1x Agent endpoints (these are x402 resources)
    const agentResources = [
      {
        id: 'r1x-agent-chat',
        name: 'r1x Agent Chat',
        description: 'AI Agent chat service powered by Claude 3 Opus. Specialized in r1x infrastructure, x402 protocol, and machine economy.',
        category: 'AI',
        resource: `${SERVER_URL}/api/r1x-agent/chat`,
        resourceAlt: `${BASE_URL}/api/r1x-agent/chat`, // Next.js proxy
        method: 'POST',
        price: '0.25',
        priceWei: '250000', // 0.25 USDC in wei (6 decimals)
        merchant: process.env.MERCHANT_ADDRESS || '0x0D644cFE30F0777CcCa6563618D9519D6b8979ac',
        network: 'base',
        chainId: 8453,
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        tokenSymbol: 'USDC',
        schema: {
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
                    enum: ['user', 'assistant'],
                    description: 'Message role',
                  },
                  content: {
                    type: 'string',
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
      },
      {
        id: 'r1x-agent-plan',
        name: 'r1x Agent Plan',
        description: 'AI agent service discovery and planning. Get ranked proposals for marketplace services based on query and category.',
        category: 'Discovery',
        resource: `${SERVER_URL}/api/r1x-agent/plan`,
        resourceAlt: `${BASE_URL}/api/r1x-agent/plan`, // Next.js proxy
        method: 'POST',
        price: '0.01',
        priceWei: '10000', // 0.01 USDC in wei (6 decimals)
        merchant: process.env.MERCHANT_ADDRESS || '0x0D644cFE30F0777CcCa6563618D9519D6b8979ac',
        network: 'base',
        chainId: 8453,
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        tokenSymbol: 'USDC',
        schema: {
          input: {
            type: 'http',
            method: 'POST',
            bodyType: 'json',
            bodyFields: {
              query: {
                type: 'string',
                required: false,
                description: 'Search query',
              },
              category: {
                type: 'string',
                required: false,
                description: 'Service category filter',
              },
              budgetMax: {
                type: 'string',
                required: false,
                description: 'Maximum budget in USDC',
              },
            },
          },
          output: {
            proposals: {
              type: 'array',
              description: 'Ranked list of service proposals',
            },
          },
        },
      },
    ];

    // Combine all resources
    const allResources = [...agentResources, ...marketplaceResources];

    return NextResponse.json({
      resources: allResources,
      total: allResources.length,
      agentResources: agentResources.length,
      marketplaceResources: marketplaceResources.length,
      network,
      chainId,
      version: '1.0',
    });
  } catch (error: any) {
    console.error('Discovery API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

