'use client';

import { 
  Connection, 
  PublicKey, 
  Transaction,
  SendTransactionError
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
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
  private rpcUrl!: string;
  private connection: Connection | null = null;
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
      // Do not initialize placeholder connection; wait for runtime RPC
    }
    
    // NOTE: QuickNode RPC supports v0 transactions and priority fees
    // If using a different RPC provider, verify v0 transaction support
  }

  private logRpcUrl() {
    const maskedUrl = this.rpcUrl.includes('api-key') 
      ? this.rpcUrl.replace(/api-key=[^&]+/, 'api-key=***')
      : this.rpcUrl.includes('quiknode')
      ? this.rpcUrl.replace(/\/[^\/]+\/[^\/]+\//, '/***/***/')
      : this.rpcUrl;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SolanaPaymentClient] Using RPC:', maskedUrl);
    }
    
    if (this.rpcUrl === 'https://api.mainnet-beta.solana.com') {
      console.warn('[SolanaPaymentClient] WARNING: Using public Solana RPC (will fail in browser). Set SOLANA_RPC_URL in Railway.');
    } else if (this.rpcUrl.includes('quiknode')) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[SolanaPaymentClient] ✅ Using QuickNode RPC from Railway');
      }
    }
  }

  /**
   * Ensure RPC URL is loaded from Railway before making requests
   */
  private async ensureRpcUrl(): Promise<void> {
    if (this.rpcUrlPromise) await this.rpcUrlPromise;
    if (!this.connection && this.rpcUrl) {
      this.connection = new Connection(this.rpcUrl, 'confirmed');
      this.logRpcUrl();
    }
  }

  /**
   * Create and sign a Solana USDC transfer transaction
   * Returns transaction signature and proof for backend verification
   */
  async transferUSDC(params: {
    to: string;
    amount: string; // Decimal string, e.g., "0.25"
    priorityMicroLamports?: number; // Optional priority fee per CU (micro-lamports)
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

    const { to, amount, priorityMicroLamports } = params;

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
      // Ensure payer has some SOL for fees (priority + ATA creation)
      try {
        const lamports = await (this.connection as Connection).getBalance(fromPubkey, 'confirmed');
        // Require at least ~0.0005 SOL to cover:
        // - Priority fees (0.0001-0.001 SOL)
        // - ATA creation if needed (0.002 SOL)
        // - Base transaction fee (0.000005 SOL)
        if (lamports < 500_000) { // 0.0005 SOL
          throw new Error('Insufficient SOL for fees. Please keep at least 0.0005 SOL for priority fees and potential ATA creation.');
        }
      } catch (balErr: any) {
        // Non-fatal check; continue if balance fails to fetch
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[SolanaPaymentClient] Balance check failed:', balErr?.message || balErr);
        }
      }

      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, fromPubkey);
      const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey);

      // Check if sender has sufficient balance
      // Wrap in try-catch to handle RPC errors (e.g., Helius 403)
      let fromAccount;
      try {
        fromAccount = await getAccount(this.connection as Connection, fromTokenAccount);
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

      // Determine if recipient ATA exists; if not, add create ATA instruction
      let needCreateRecipientAta = false;
      try {
        await getAccount(this.connection as Connection, toTokenAccount);
      } catch {
        needCreateRecipientAta = true;
      }

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        amountAtomic,
        []
      );

      // Minimal send: legacy Transaction format (most common for simple USDC transfers)
      // No v0, no priority fees, no compute budget - just ATA create + USDC transfer
      const sendOnce = async (): Promise<string> => {
        // Create legacy Transaction (not v0)
        const transaction = new Transaction();

        // Create recipient ATA if needed
        if (needCreateRecipientAta) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              fromPubkey,       // payer
              toTokenAccount,   // ata to create
              toPubkey,         // owner of ata
              mintPubkey        // token mint
            )
          );
        }

        // Add USDC transfer
        transaction.add(transferInstruction);

        // Get recent blockhash (legacy Transaction format)
        let blockhash;
        try {
          const blockhashResult = await (this.connection as Connection).getLatestBlockhash('confirmed');
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

        // Set blockhash and fee payer (legacy Transaction)
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        // Sign transaction with wallet
        const signedTransaction = await this.wallet.signTransaction(transaction);

        // Send transaction - use sendTransaction (not sendRawTransaction) for legacy format
        // This is the simplest, most common approach
        let signature;
        try {
          signature = await (this.connection as Connection).sendTransaction(signedTransaction, [], {
            skipPreflight: true, // Skip simulation to avoid QuickNode issues
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
        await (this.connection as Connection).confirmTransaction(signature, 'confirmed');
        return signature;
      };

      // Minimal path: build and send once (skip preflight)
      const sig = await sendOnce();
      return {
        signature: sig,
        proof: {
          signature: sig,
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

