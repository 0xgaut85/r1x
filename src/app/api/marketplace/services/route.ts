/**
 * Marketplace Services API
 * 
 * Returns available x402 services, tokens, and marketplace listings
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketplaceService } from '@/lib/types/x402';

// TODO: Replace with actual service registry or database
const MOCK_SERVICES: MarketplaceService[] = [
  {
    id: 'api-claude-sonnet',
    name: 'Claude Sonnet API',
    description: 'Access to Anthropic Claude Sonnet model via API',
    price: '0.01', // 0.01 USDC per request
    merchant: process.env.MERCHANT_ADDRESS || '',
    category: 'AI Inference',
    endpoint: '/api/ai/claude',
    available: true,
  },
  {
    id: 'api-gpt-4',
    name: 'GPT-4 API Access',
    description: 'Pay-per-call access to OpenAI GPT-4',
    price: '0.02',
    merchant: process.env.MERCHANT_ADDRESS || '',
    category: 'AI Inference',
    endpoint: '/api/ai/gpt4',
    available: true,
  },
  {
    id: 'data-market-feed',
    name: 'Market Data Feed',
    description: 'Real-time cryptocurrency market data stream',
    price: '0.05',
    merchant: process.env.MERCHANT_ADDRESS || '',
    category: 'Data Streams',
    endpoint: '/api/data/market',
    available: true,
  },
  {
    id: 'compute-gpu',
    name: 'GPU Compute',
    description: 'On-demand GPU compute resources',
    price: '1.00',
    merchant: process.env.MERCHANT_ADDRESS || '',
    category: 'Compute Resources',
    endpoint: '/api/compute/gpu',
    available: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const merchant = searchParams.get('merchant');

    let services = MOCK_SERVICES;

    // Filter by category if provided
    if (category) {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by merchant if provided
    if (merchant) {
      services = services.filter(s => s.merchant.toLowerCase() === merchant.toLowerCase());
    }

    return NextResponse.json({
      services,
      total: services.length,
    });
  } catch (error: any) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred fetching services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    const service = MOCK_SERVICES.find(s => s.id === serviceId);

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error('Marketplace API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

