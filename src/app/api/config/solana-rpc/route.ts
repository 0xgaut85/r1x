import { NextResponse } from 'next/server';

/**
 * Runtime API route to get Solana RPC URL from Railway env vars
 * Uses SOLANA_RPC_URL (server-side only, not NEXT_PUBLIC_*)
 * This avoids build-time embedding issues
 */
export async function GET() {
  // Use server-side env var (SOLANA_RPC_URL) - not exposed to client
  const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  
  if (!rpcUrl) {
    return NextResponse.json(
      { error: 'Solana RPC URL not configured. Set SOLANA_RPC_URL in Railway.' },
      { status: 500 }
    );
  }

  // Remove trailing slash if present
  const cleanedRpc = rpcUrl.trim().endsWith('/') 
    ? rpcUrl.trim().slice(0, -1) 
    : rpcUrl.trim();

  return NextResponse.json({ 
    rpcUrl: cleanedRpc,
    source: process.env.SOLANA_RPC_URL ? 'SOLANA_RPC_URL' : 'NEXT_PUBLIC_SOLANA_RPC_URL'
  });
}

