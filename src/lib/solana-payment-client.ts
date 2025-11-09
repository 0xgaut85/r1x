'use client';

import { Connection, PublicKey, Transaction, ComputeBudgetProgram, SendTransactionError } from '@solana/web3.js';
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
        // Require at least ~0.0005 SOL to cover small priority and potential ATA creation
        if (lamports < 500_000) {
          throw new Error('Insufficient SOL for fees. Please keep at least 0.0005 SOL for priority/ATA creation.');
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

      // Attempts with escalating priority fees to satisfy tip account write-lock
      // CRITICAL: Priority fee instructions MUST be added FIRST before any other instructions
      // This ensures the transaction can write-lock tip accounts (required for Solana v0)
      const attemptSend = async (microLamports: number): Promise<string> => {
        // Create transaction with priority fees (required for Solana v0 transactions)
        const transaction = new Transaction();
      
        // CRITICAL: Add compute budget instructions FIRST (before any other instructions)
        // This fixes "Transaction must write lock at least one tip account" error
        // Higher compute units for ATA creation (400k vs 200k)
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: needCreateRecipientAta ? 400_000 : 200_000,
        });
        
        // Priority fee MUST be set to write-lock tip accounts
        // Higher micro-lamports = higher priority = more likely to succeed
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports, // dynamic - will retry with higher values if needed
        });
        
        // Add priority fee instructions FIRST (critical for tip account write-lock)
        transaction.add(modifyComputeUnits);
        transaction.add(addPriorityFee);

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

        transaction.add(transferInstruction);

        // Get recent blockhash (may also fail with RPC errors)
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
          signature = await (this.connection as Connection).sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            maxRetries: 3,
          });
        } catch (sendError: any) {
          // Surface simulation logs if available
          if (sendError instanceof SendTransactionError) {
            const logs = (sendError as any).logs || (sendError as any)?.cause?.logs;
            if (logs && process.env.NODE_ENV !== 'production') {
              console.error('[SolanaPaymentClient] Simulation logs:', logs);
            }
          }
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
        await (this.connection as Connection).confirmTransaction(signature, 'confirmed');
        return signature;
      };

      // Use provided priority or start with higher default to satisfy tip account write-lock requirement
      // Solana v0 transactions require priority fees to write-lock tip accounts
      // Start with 100k micro-lamports (higher than before) to reduce retries
      const firstPriority = typeof priorityMicroLamports === 'number' ? priorityMicroLamports : 100_000;
      
      // Retry with escalating priority fees if tip account error occurs
      const priorities = [firstPriority, 200_000, 500_000, 1_000_000]; // Escalate up to 1M micro-lamports
      
      let lastError: any = null;
      for (let i = 0; i < priorities.length; i++) {
        const priority = priorities[i];
        try {
          if (i > 0 && process.env.NODE_ENV !== 'production') {
            console.warn(`[SolanaPaymentClient] Retry ${i} with priority fee: ${priority} micro-lamports`);
          }
          const sig = await attemptSend(priority);
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
        } catch (e: any) {
          const emsg = String(e?.message || '');
          const tipLockError = emsg.toLowerCase().includes('write lock at least one tip account') ||
                               emsg.toLowerCase().includes('tip account') ||
                               emsg.toLowerCase().includes('simulation failed');
          
          if (tipLockError && i < priorities.length - 1) {
            // Try next higher priority fee
            lastError = e;
            continue;
          }
          // Not a tip account error, or we've exhausted all retries
          throw e;
        }
      }
      
      // If we get here, all retries failed
      throw lastError || new Error('Failed to send transaction after multiple priority fee attempts');

    } catch (error: any) {
      console.error('[SolanaPaymentClient] Transfer error:', error);
      throw new Error(`Solana USDC transfer failed: ${error.message}`);
    }
  }
}

