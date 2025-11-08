'use client';

import { useEffect, useState } from 'react';
import { getRuntimeConfig } from '@/lib/runtime-config';

interface CryptoLogoProps {
  symbol: string; // Token symbol (e.g., 'USDC', 'BASE', 'ETH')
  size?: number; // Size in pixels (default: 24)
  className?: string;
  fallback?: string; // Fallback text or symbol
}

// Runtime-loaded LogoKit API key from Railway (client-safe)
let LOGOKIT_API_KEY: string | null = null;

/**
 * CryptoLogo component - displays crypto logos using logokit.com
 * Uses format: https://img.logokit.com/crypto/{symbol}?token={api_key}&size={size}
 * Supports tokens (USDC, ETH, etc.) and networks (BASE, etc.)
 */
export default function CryptoLogo({ 
  symbol, 
  size = 24, 
  className = '',
  fallback 
}: CryptoLogoProps) {
  const [error, setError] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(LOGOKIT_API_KEY);

  useEffect(() => {
    if (apiKey) return;
    getRuntimeConfig()
      .then(cfg => {
        LOGOKIT_API_KEY = cfg.logokitApiKey || null;
        setApiKey(LOGOKIT_API_KEY);
      })
      .catch(() => {
        // Ignore, will use fallback behavior
      });
  }, [apiKey]);

  if (!symbol) {
    return null;
  }

  // Normalize symbol for logokit API (uppercase)
  const normalizedSymbol = symbol.toUpperCase();
  
  // Build logokit API URL
  // Format: https://img.logokit.com/crypto/{symbol}?token={api_key}&size={size}
  const logoUrl = `https://img.logokit.com/crypto/${normalizedSymbol}?token=${apiKey || ''}&size=${size}`;

  // If error, show fallback
  if (error) {
    if (fallback) {
      return (
        <span className={className} style={{ fontSize: `${size * 0.7}px` }}>
          {fallback}
        </span>
      );
    }
    // Default fallback: show first letter or symbol in a circle
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-full bg-gray-200 ${className}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          fontSize: `${size * 0.5}px`,
          flexShrink: 0
        }}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={normalizedSymbol}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ 
        borderRadius: '50%',
        flexShrink: 0,
        objectFit: 'contain'
      }}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

