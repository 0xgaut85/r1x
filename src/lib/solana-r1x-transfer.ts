'use client';

import { 
  Connection, 
  PublicKey, 
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { getSolanaRpcUrl } from './solana-rpc-config';

// R1X token mint address on Solana
const R1X_MINT = '5DDYWuhWN8PDgNyu9Khgmqt4AkJmtAZarFBKah4Epump';

/**
 * Transfer R1X tokens on Solana
 */
export async function transferR1X(params: {
  wallet: any; // Phantom or Solflare wallet adapter
  to: string; // Recipient address (Base58)
  amount: string; // Decimal string, e.g., "100"
}): Promise<string> {
  const { wallet, to, amount } = params;

  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  // Get RPC URL
  const rpcUrl = await getSolanaRpcUrl();
  const connection = new Connection(rpcUrl, 'confirmed');

  const fromPubkey = new PublicKey(wallet.publicKey);
  const toPubkey = new PublicKey(to);
  const mintPubkey = new PublicKey(R1X_MINT);

  // R1X token has 6 decimals (same as USDC)
  const amountAtomic = BigInt(Math.floor(parseFloat(amount) * 1_000_000));

  // Get associated token addresses
  const fromTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    fromPubkey
  );

  const toTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    toPubkey
  );

  // Check if sender has sufficient balance
  let fromAccount;
  try {
    fromAccount = await getAccount(connection, fromTokenAccount);
  } catch (error: any) {
    const errorMessage = error?.message || '';
    if (
      errorMessage.includes('TokenAccountNotFoundError') ||
      errorMessage.includes('InvalidAccountData') ||
      errorMessage.includes('could not find account')
    ) {
      throw new Error('You do not have any R1X tokens. Please acquire R1X tokens first.');
    }
    throw new Error(`Failed to check R1X balance: ${errorMessage}`);
  }

  // Check balance
  const senderBalance = Number(fromAccount.amount) / 1_000_000;
  if (senderBalance < parseFloat(amount)) {
    throw new Error(`Insufficient R1X balance. You have ${senderBalance.toFixed(6)} R1X, but trying to transfer ${amount} R1X.`);
  }

  // Check if recipient ATA exists
  let needCreateRecipientAta = false;
  try {
    await getAccount(connection, toTokenAccount);
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

  // Create transaction
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

  // Add R1X transfer
  transaction.add(transferInstruction);

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;

  // Use Phantom's recommended method: signAndSendTransaction
  // This is safer and simpler than manual signing + sending
  if (wallet.signAndSendTransaction) {
    const { signature } = await wallet.signAndSendTransaction(transaction);
    
    // Poll for confirmation
    const timeout = 15000;
    const interval = 3000;
    let elapsed = 0;

    while (elapsed < timeout) {
      const status = await connection.getSignatureStatuses([signature]);
      if (status?.value[0]?.confirmationStatus === 'confirmed' || status?.value[0]?.confirmationStatus === 'finalized') {
        return signature;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
      elapsed += interval;
    }

    throw new Error(`Transaction confirmation timeout: ${signature}`);
  } else {
    // Fallback for wallets that don't support signAndSendTransaction
    let signedTransaction;
    if (wallet.signTransaction) {
      signedTransaction = await wallet.signTransaction(transaction);
    } else if (wallet.signAllTransactions) {
      const signed = await wallet.signAllTransactions([transaction]);
      signedTransaction = signed[0];
    } else {
      throw new Error('Wallet does not support transaction signing');
    }

    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      { skipPreflight: false }
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }
}

/**
 * Get R1X token balance for a Solana address
 * Returns balance as a decimal string (e.g., "100.5")
 */
export async function getR1XBalance(address: string): Promise<string> {
  if (!address) {
    return '0';
  }

  try {
    const rpcUrl = await getSolanaRpcUrl();
    const connection = new Connection(rpcUrl, 'confirmed');

    const pubkey = new PublicKey(address);
    const mintPubkey = new PublicKey(R1X_MINT);

    // Get the associated token address
    const tokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      pubkey
    );

    try {
      // Try to get the account - this will throw if it doesn't exist
      const account = await getAccount(connection, tokenAccount);
      
      // R1X token has 6 decimals (same as USDC)
      const balance = Number(account.amount) / 1_000_000;
      
      // Return formatted balance, removing trailing zeros
      return balance.toFixed(6).replace(/\.?0+$/, '');
    } catch (error: any) {
      // If account doesn't exist, user has 0 balance
      // Check if it's specifically a "TokenAccountNotFoundError" or similar
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('TokenAccountNotFoundError') ||
        errorMessage.includes('InvalidAccountData') ||
        errorMessage.includes('could not find account')
      ) {
        return '0';
      }
      
      // For other errors, log and return 0
      console.error('[getR1XBalance] Error fetching balance:', error);
      return '0';
    }
  } catch (error: any) {
    console.error('[getR1XBalance] Error:', error);
    return '0';
  }
}

