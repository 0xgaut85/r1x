'use client';

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';
import { usdcToAtomic } from './solana-payment';
import { getSolanaRpcUrl } from './solana-rpc-config';

// USDC mint address on Solana mainnet
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

/**
 * Solana USDC payment client
 * Creates and signs Solana USDC transfer transactions using @solana/web3.js
 * Uses Railway env vars at runtime (not build time)
 */
export class SolanaPaymentClient {
  private wallet: any; // Phantom or Solflare wallet adapter
  private rpcUrl: string;
  private connection: Connection;
  private rpcUrlPromise: Promise<string> | null = null;

  constructor(wallet: any, rpcUrl?: string) {
    this.wallet = wallet;
    
    // If RPC URL provided, use it; otherwise fetch from Railway at runtime
    if (rpcUrl) {
      this.rpcUrl = rpcUrl;
      this.connection = new Connection(this.rpcUrl, 'confirmed');
      this.logRpcUrl();
    } else {
      // Fetch from Railway runtime config
      this.rpcUrlPromise = getSolanaRpcUrl().then((url) => {
        this.rpcUrl = url;
        this.connection = new Connection(this.rpcUrl, 'confirmed');
        this.logRpcUrl();
        return url;
      });
      
      // Initialize with placeholder (will be updated when promise resolves)
      this.rpcUrl = 'https://api.mainnet-beta.solana.com';
      this.connection = new Connection(this.rpcUrl, 'confirmed');
    }
  }

  private logRpcUrl() {
    const maskedUrl = this.rpcUrl.includes('api-key') 
      ? this.rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
      : this.rpcUrl.includes('quiknode')
      ? this.rpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
      : this.rpcUrl;
    console.log('[SolanaPaymentClient] Using RPC:', maskedUrl);
    
    if (this.rpcUrl === 'https://api.mainnet-beta.solana.com') {
      console.warn('[SolanaPaymentClient] WARNING: Using public Solana RPC (will fail in browser). Set SOLANA_RPC_URL in Railway.');
    } else if (this.rpcUrl.includes('quiknode')) {
      console.log('[SolanaPaymentClient] ✅ Using QuickNode RPC from Railway');
    }
  }

  /**
   * Ensure RPC URL is loaded from Railway before making requests
   */
  private async ensureRpcUrl(): Promise<void> {
    if (this.rpcUrlPromise) {
      await this.rpcUrlPromise;
    }
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
    // Ensure RPC URL is loaded from Railway before making requests
    await this.ensureRpcUrl();

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
      // Wrap in try-catch to handle RPC errors (e.g., Helius 403)
      let fromAccount;
      try {
        fromAccount = await getAccount(this.connection, fromTokenAccount);
      } catch (rpcError: any) {
        const errorMsg = String(rpcError?.message || '');
        const errorString = JSON.stringify(rpcError || {});
        // If RPC error (403, invalid endpoint, etc.), fallback to public RPC
        const isRpcError = 
          errorMsg.includes('403') ||
          errorMsg.toLowerCase().includes('access forbidden') ||
          errorMsg.includes('Endpoint URL must start') ||
          errorString.includes('"code": 403') ||
          errorString.includes('"code":403');
        
        if (isRpcError) {
          // Provide helpful error message
          if (this.rpcUrl.includes('helius-rpc.com')) {
            throw new Error(
              'Helius RPC returned 403. Please ensure your domain is allowlisted in Helius dashboard. ' +
              'Domain: ' + (typeof window !== 'undefined' ? window.location.origin : 'unknown') +
              '. Once allowlisted, refresh the page and try again.'
            );
          } else {
            // If not using Helius/QuickNode, provide helpful error
            const currentRpc = this.rpcUrl.includes('quiknode') ? 'QuickNode' : 
                              this.rpcUrl.includes('helius') ? 'Helius' : 
                              'public Solana RPC';
            throw new Error(
              `Solana RPC error (403). Current RPC: ${currentRpc}. ` +
              `Please ensure SOLANA_RPC_URL is set with a QuickNode RPC URL in Railway. ` +
              `QuickNode URL format: https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR-API-KEY/`
            );
          }
        } else {
          throw rpcError;
        }
      }

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

      // Get recent blockhash (may also fail with RPC errors)
      let blockhash;
      try {
        const blockhashResult = await this.connection.getLatestBlockhash('confirmed');
        blockhash = blockhashResult.blockhash;
      } catch (blockhashError: any) {
        const errorMsg = String(blockhashError?.message || '');
        const errorString = JSON.stringify(blockhashError || {});
        const isRpcError = 
          errorMsg.includes('403') ||
          errorMsg.toLowerCase().includes('access forbidden') ||
          errorMsg.includes('Endpoint URL must start') ||
          errorString.includes('"code": 403') ||
          errorString.includes('"code":403');
        
        if (isRpcError) {
          // Same error handling as above
          if (this.rpcUrl.includes('helius-rpc.com')) {
            throw new Error(
              'Helius RPC returned 403. Please ensure your domain is allowlisted in Helius dashboard. ' +
              'Domain: ' + (typeof window !== 'undefined' ? window.location.origin : 'unknown')
            );
          } else {
            const currentRpc = this.rpcUrl.includes('quiknode') ? 'QuickNode' : 
                              this.rpcUrl.includes('helius') ? 'Helius' : 
                              'public Solana RPC';
            throw new Error(
              `Solana RPC error (403). Current RPC: ${currentRpc}. ` +
              `Please ensure SOLANA_RPC_URL is set with QuickNode URL in Railway.`
            );
          }
        } else {
          throw blockhashError;
        }
      }

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Sign transaction with wallet
      const signedTransaction = await this.wallet.signTransaction(transaction);

      // Send transaction (may also fail with RPC errors)
      let signature;
      try {
        signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });
      } catch (sendError: any) {
        const errorMsg = String(sendError?.message || '');
        const errorString = JSON.stringify(sendError || {});
        const isRpcError = 
          errorMsg.includes('403') ||
          errorMsg.toLowerCase().includes('access forbidden') ||
          errorMsg.includes('Endpoint URL must start') ||
          errorString.includes('"code": 403') ||
          errorString.includes('"code":403');
        
        if (isRpcError) {
          // Same error handling as above
          if (this.rpcUrl.includes('helius-rpc.com')) {
            throw new Error(
              'Helius RPC returned 403. Please ensure your domain is allowlisted in Helius dashboard. ' +
              'Domain: ' + (typeof window !== 'undefined' ? window.location.origin : 'unknown')
            );
          } else {
            const currentRpc = this.rpcUrl.includes('quiknode') ? 'QuickNode' : 
                              this.rpcUrl.includes('helius') ? 'Helius' : 
                              'public Solana RPC';
            throw new Error(
              `Solana RPC error (403). Current RPC: ${currentRpc}. ` +
              `Please ensure SOLANA_RPC_URL is set with QuickNode URL in Railway.`
            );
          }
        } else {
          throw sendError;
        }
      }

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
      throw new Error(`Solana USDC transfer failed: ${error.message}`);
    }
  }
}

