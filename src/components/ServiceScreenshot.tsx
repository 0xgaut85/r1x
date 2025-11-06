'use client';

import { useState, useEffect } from 'react';

interface ServiceScreenshotProps {
  url: string; // Service endpoint URL or website URL
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

// ApiFlash access key - can be set via NEXT_PUBLIC_APIFLASH_ACCESS_KEY env var
// Defaults to provided key if not set
const APIFLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_APIFLASH_ACCESS_KEY || 'ce5f48b2fe794fadb9c837e7778cb844';
const APIFLASH_BASE_URL = 'https://api.apiflash.com/v1/urltoimage';

/**
 * ServiceScreenshot component - displays website screenshots using ApiFlash
 * For marketplace services, APIs, tokens, mints, etc.
 */
export default function ServiceScreenshot({ 
  url, 
  alt = 'Service preview',
  className = '',
  width = 400,
  height = 250
}: ServiceScreenshotProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    // Normalize URL - ensure it has protocol
    let normalizedUrl = url.trim();

    // Derive a project homepage if the input looks like an API/endpoint
    const apiPathPattern = /^https?:\/\/[^\/]+\/(api|v\d+)(\/|$)/i;
    const hasPathApi = normalizedUrl.includes('/api/')
      || normalizedUrl.includes('/v1/')
      || normalizedUrl.includes('/v2/')
      || normalizedUrl.includes('/v3/')
      || apiPathPattern.test(normalizedUrl);

    try {
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      const u = new URL(normalizedUrl);

      // Detect API-style subdomains like api.example.com, dev-api.example.com, staging-api.example.com
      const hasApiSubdomain = /^([a-z0-9-]+-)?api\./i.test(u.hostname);
      // If we detect API subdomain, strip the api/staging-api prefix to get the project site
      let homepageHost = u.host;
      if (hasApiSubdomain) {
        homepageHost = homepageHost.replace(/^([a-z0-9-]+-)?api\./i, '');
      }

      if (hasApiSubdomain || (hasPathApi || (u.pathname && u.pathname !== '/' && u.pathname.includes('/api/')))) {
        // Screenshot the project website (apex or non-api subdomain) instead of the API path
        normalizedUrl = `${u.protocol}//${homepageHost}`;
      }
    } catch {
      // Fall back: if it's clearly a path-like or starts with '/', we cannot screenshot reliably
      if (normalizedUrl.startsWith('/')) {
        setLoading(false);
        setError(true);
        return;
      }
      // Else leave normalizedUrl as-is (browser will attempt)
    }

    // Build ApiFlash URL
    // Format: https://api.apiflash.com/v1/urltoimage?access_key={key}&url={url}&width={width}&height={height}
    const apiUrl = `${APIFLASH_BASE_URL}?access_key=${APIFLASH_ACCESS_KEY}&url=${encodeURIComponent(normalizedUrl)}&width=${width}&height=${height}&format=png&response_type=image&wait_until=page_loaded&delay=2`;

    // Preload image to check if it works
    const img = new window.Image();
    img.onload = () => {
      setScreenshotUrl(apiUrl);
      setLoading(false);
      setError(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
      setScreenshotUrl(null);
    };
    img.src = apiUrl;
  }, [url, width, height]);

  if (!url) {
    return null;
  }

  if (loading) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#FF4D00] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !screenshotUrl) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <span className="text-xs" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          No preview
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: `${width}px`, height: `${height}px` }}>
      <img
        src={screenshotUrl}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}

