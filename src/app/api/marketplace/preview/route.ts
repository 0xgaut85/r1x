/**
 * Next.js API Route - APIFLASH Screenshot Preview
 * 
 * Generates APIFLASH screenshot URLs for marketplace service previews
 * Caches URLs in database for fast loads
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const APIFLASH_ACCESS_KEY = process.env.APIFLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_APIFLASH_ACCESS_KEY || 'ce5f48b2fe794fadb9c837e7778cb844';
const APIFLASH_BASE_URL = 'https://api.apiflash.com/v1/urltoimage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const serviceId = searchParams.get('serviceId');
    const width = parseInt(searchParams.get('width') || '1200');
    const height = parseInt(searchParams.get('height') || '630');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // If the provided URL is an API/endpoint or x402 subdomain, screenshot the project homepage instead
    try {
      const urlObj = new URL(normalizedUrl);

      const hasApiSubdomain = /^([a-z0-9-]+-)?api\./i.test(urlObj.hostname);
      const hasX402Subdomain = /^([a-z0-9-]+-)?x402\./i.test(urlObj.hostname);

      const hostParts = urlObj.hostname.split('.');
      const apex = hostParts.length >= 2 ? hostParts.slice(-2).join('.') : urlObj.hostname;

      let homepageHost = urlObj.host;
      if (hasApiSubdomain) {
        homepageHost = homepageHost.replace(/^([a-z0-9-]+-)?api\./i, '');
      } else if (hasX402Subdomain) {
        homepageHost = `www.${apex}`;
      }

      if (hasApiSubdomain || hasX402Subdomain || urlObj.pathname.startsWith('/api/') || urlObj.pathname.includes('/api/')) {
        normalizedUrl = `${urlObj.protocol}//${homepageHost}`;
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if we have a cached screenshot URL in database (if serviceId provided)
    if (serviceId) {
      try {
        const service = await prisma.service.findUnique({
          where: { serviceId },
          select: { screenshotUrl: true },
        });

        if (service?.screenshotUrl) {
          // Return cached URL with cache headers
          return NextResponse.json(
            { screenshotUrl: service.screenshotUrl, cached: true },
            {
              headers: {
                'Cache-Control': 'public, max-age=86400', // 24 hours
              },
            }
          );
        }
      } catch (error: any) {
        // If migration not applied, screenshotUrl column doesn't exist - skip cache check
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          console.warn('[Preview API] Migration not applied, skipping screenshot cache check');
        } else {
          throw error;
        }
      }
    }

    // Build APIFLASH URL
    const apiUrl = `${APIFLASH_BASE_URL}?access_key=${APIFLASH_ACCESS_KEY}&url=${encodeURIComponent(normalizedUrl)}&width=${width}&height=${height}&format=png&response_type=image&wait_until=page_loaded&delay=2`;

    // Update database with screenshot URL if serviceId provided
    if (serviceId) {
      try {
        await prisma.service.update({
          where: { serviceId },
          data: { screenshotUrl: apiUrl },
        });
      } catch (error: any) {
        // Non-blocking - log but don't fail
        // If migration not applied, screenshotUrl column doesn't exist - skip cache
        if (error.code === 'P2022' || error.message?.includes('does not exist')) {
          console.warn('[Preview API] Migration not applied, skipping screenshot cache');
        } else {
          console.warn('[Preview API] Failed to cache screenshot URL:', error);
        }
      }
    }

    return NextResponse.json(
      { screenshotUrl: apiUrl, cached: false },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400', // 24 hours
        },
      }
    );
  } catch (error: any) {
    console.error('[Preview API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview URL' },
      { status: 500 }
    );
  }
}

