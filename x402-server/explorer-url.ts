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

  // Determine network from chainId if network not provided
  const isSolana = network === 'solana' || chainId === 0 || chainId === null;
  
  // Solana uses Solscan
  if (isSolana) {
    // Solana signatures are base58 encoded, not hex
    // Remove any 0x prefix if present (shouldn't be for Solana, but just in case)
    const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
    return `https://solscan.io/tx/${cleanHash}`;
  }
  
  // Base/EVM networks use Basescan
  // Base chainId is 8453
  const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
  return `https://basescan.org/tx/${cleanHash}`;
}

