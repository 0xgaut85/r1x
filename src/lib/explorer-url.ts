/**
 * Get the correct block explorer URL for a transaction hash based on network/chainId
 * 
 * @param hash - Transaction hash or signature
 * @param network - Network name ('solana', 'base', etc.) or null
 * @param chainId - Chain ID (0 for Solana, 8453 for Base, etc.)
 * @returns Explorer URL or null if hash is invalid
 */
export function getExplorerUrl(
  hash: string | null | undefined,
  network?: string | null,
  chainId?: number | null
): string | null {
  if (!hash) return null;

  const isHexHash = typeof hash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(hash);

  // Prefer signature format detection: non-hex => Solana
  if (!isHexHash) {
    const cleanSig = hash.startsWith('0x') ? hash.slice(2) : hash;
    return `https://solscan.io/tx/${cleanSig}`;
  }

  // Fall back to explicit network hints
  const isSolana = network === 'solana' || chainId === 0 || chainId === null;
  if (isSolana) {
    const cleanSig = hash.startsWith('0x') ? hash.slice(2) : hash;
    return `https://solscan.io/tx/${cleanSig}`;
  }

  // Default EVM/Base
  const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
  return `https://basescan.org/tx/${cleanHash}`;
}

/**
 * Get explorer label for display (e.g., "View on Solscan" or "View on BaseScan")
 */
export function getExplorerLabel(network?: string | null, chainId?: number | null, hash?: string | null): string {
  const isHexHash = typeof hash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(hash);
  if (!isHexHash) return 'View on Solscan';
  const isSolana = network === 'solana' || chainId === 0 || chainId === null;
  return isSolana ? 'View on Solscan' : 'View on BaseScan';
}


