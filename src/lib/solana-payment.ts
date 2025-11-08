'use client';

/**
 * Solana payment utilities
 * 
 * Note: For now, we'll create basic proof structure.
 * Daydreams Router SDK integration will be added once we confirm
 * the exact API for creating payments via the router.
 */

/**
 * Convert decimal USDC amount to atomic units (6 decimals on Solana)
 */
export function usdcToAtomic(amount: string): string {
  const [whole, frac = ''] = amount.split('.');
  const paddedFrac = (frac + '000000').slice(0, 6);
  return `${BigInt(whole) * BigInt(1_000_000) + BigInt(paddedFrac)}`;
}

/**
 * Format atomic USDC amount to decimal string
 */
export function atomicToUsdc(amount: string): string {
  try {
    const v = BigInt(amount);
    const whole = v / BigInt(1_000_000);
    const frac = (v % BigInt(1_000_000)).toString().padStart(6, '0');
    return `${whole.toString()}.${frac}`;
  } catch {
    return amount;
  }
}

