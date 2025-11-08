'use client';

import { useState } from 'react';

interface CryptoLogoProps {
  symbol: string; // Token symbol (e.g., 'USDC', 'BASE', 'ETH')
  size?: number; // Size in pixels (default: 24)
  className?: string;
  fallback?: string; // Fallback text or symbol
}

// LogoKit API key - can be set via NEXT_PUBLIC_LOGOKIT_API_KEY env var
// Defaults to provided key if not set
const LOGOKIT_API_KEY = process.env.NEXT_PUBLIC_LOGOKIT_API_KEY || 'pk_fr8612cc333de53ac8f39b';

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

  if (!symbol) {
    return null;
  }

  // Normalize symbol for logokit API (uppercase)
  const normalizedSymbol = symbol.toUpperCase();
  
  // Build logokit API URL
  // Format: https://img.logokit.com/crypto/{symbol}?token={api_key}&size={size}
  const logoUrl = `https://img.logokit.com/crypto/${normalizedSymbol}?token=${LOGOKIT_API_KEY}&size=${size}`;

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

