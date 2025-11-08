'use client';

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';
import { usdcToAtomic } from './solana-payment';

// USDC mint address on Solana mainnet
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

/**
 * Solana USDC payment client
 * Creates and signs Solana USDC transfer transactions using @solana/web3.js
 */
export class SolanaPaymentClient {
  private wallet: any; // Phantom or Solflare wallet adapter
  private rpcUrl: string;
  private connection: Connection;
  private didFallbackToPublicRpc: boolean = false;

  constructor(wallet: any, rpcUrl?: string) {
    this.wallet = wallet;
    this.rpcUrl = rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }

  /**
   * Create and sign a Solana USDC transfer transaction
   * Returns transaction signature and proof for backend verification
   */
  async transferUSDC(params: {
    to: string;
    amount: string; // Decimal string, e.g., "0.25"
  }): Promise<{
    signature: string;
    proof: {
      signature: string;
      from: string;
      to: string;
      amount: string;
      tokenSymbol: string;
      token: string;
    };
  }> {
    if (!this.wallet || !this.wallet.isConnected) {
      throw new Error('Solana wallet not connected');
    }

    const { to, amount } = params;

    // Get wallet public key
    const publicKey = this.wallet.publicKey;
    if (!publicKey) {
      throw new Error('Wallet public key not available');
    }

    const fromPubkey = new PublicKey(publicKey.toString());
    const toPubkey = new PublicKey(to);
    const mintPubkey = new PublicKey(USDC_MINT);

    // Convert amount to atomic units (USDC has 6 decimals on Solana)
    const amountAtomic = BigInt(usdcToAtomic(amount));

    try {
      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
      const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);

      // Check if sender has sufficient balance
      const fromAccount = await getAccount(this.connection, fromTokenAccount);
      if (fromAccount.amount < amountAtomic) {
        throw new Error(`Insufficient USDC balance. Required: ${amount}, Available: ${Number(fromAccount.amount) / 1e6}`);
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        amountAtomic,
        []
      );

      // Create transaction
      const transaction = new Transaction().add(transferInstruction);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Sign transaction with wallet
      const signedTransaction = await this.wallet.signTransaction(transaction);

      // Send transaction
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      return {
        signature,
        proof: {
          signature,
          from: fromPubkey.toString(),
          to: toPubkey.toString(),
          amount: amountAtomic.toString(),
          tokenSymbol: 'USDC',
          token: USDC_MINT,
        },
      };
    } catch (error: any) {
      console.error('[SolanaPaymentClient] Transfer error:', error);
      // Fallback: some RPC providers (e.g., Helius) may block browser requests (403).
      // Retry once via public Solana RPC to complete the user flow.
      const message: string = error?.message || '';
      const needsFallback =
        !this.didFallbackToPublicRpc &&
        (message.includes('403') ||
          message.toLowerCase().includes('access forbidden') ||
          message.includes('Endpoint URL must start'));

      if (needsFallback) {
        try {
          this.didFallbackToPublicRpc = true;
          this.rpcUrl = 'https://api.mainnet-beta.solana.com';
          this.connection = new Connection(this.rpcUrl, 'confirmed');
          // Retry once
          return await this.transferUSDC(params);
        } catch (retryErr: any) {
          console.error('[SolanaPaymentClient] Fallback transfer error:', retryErr);
          throw new Error(`Solana USDC transfer failed: ${retryErr?.message || 'Unknown error'}`);
        }
      }

      throw new Error(`Solana USDC transfer failed: ${error.message}`);
    }
  }
}

