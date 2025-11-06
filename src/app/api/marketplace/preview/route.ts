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

    // Skip API endpoints - these won't render well as screenshots
    try {
      const urlObj = new URL(normalizedUrl);
      if (urlObj.pathname.startsWith('/api/') || urlObj.pathname.includes('/api/')) {
        return NextResponse.json(
          { error: 'API endpoints cannot be screenshot', screenshotUrl: null },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if we have a cached screenshot URL in database (if serviceId provided)
    if (serviceId) {
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
      } catch (error) {
        // Non-blocking - log but don't fail
        console.warn('[Preview API] Failed to cache screenshot URL:', error);
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

