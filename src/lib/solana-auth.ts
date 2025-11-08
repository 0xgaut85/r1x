'use client';

import { createSolanaAuthFromPublicKey } from '@daydreamsai/ai-sdk-provider';
import { getSolanaRpcUrl } from './solana-rpc-config';

/**
 * Initializes Daydreams Solana auth using a wallet provider that supports
 * publicKey and signMessage (e.g., Phantom / Solflare).
 *
 * Per Daydreams docs:
 * createSolanaAuthFromPublicKey(publicKey, async ({ message }) => wallet.signMessage(message), { payments: { network, rpcUrl } })
 */
export async function createDaydreamsSolanaAuth(params: {
  publicKeyBase58: string;
  signMessage: (message: string) => Promise<Uint8Array | string>;
}) {
  // Fetch RPC URL from Railway at runtime
  const rpcUrl = await getSolanaRpcUrl();

  // Daydreams SDK expects a signer that receives a string message
  // and returns a signature. Wallet adapters (e.g., Phantom) typically
  // sign bytes; we normalize here.
  const signer = async ({ message }: { message: string }) => {
    const result = await params.signMessage(message);
    // Support both byte-array and base64 strings
    if (typeof result === 'string') return result;
    // Convert Uint8Array to base64 for transport if needed
    return btoa(String.fromCharCode(...Array.from(result)));
  };

  const auth = await createSolanaAuthFromPublicKey(
    params.publicKeyBase58,
    signer,
    {
      payments: {
        network: 'solana',
        rpcUrl,
      },
    }
  );

  return auth;
}


