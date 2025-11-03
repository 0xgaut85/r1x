/**
 * Fee Transfer Utilities
 * 
 * Handles on-chain fee transfers to fee recipient wallet
 */

import { createWalletClient, parseUnits, createPublicClient, formatUnits, http } from 'viem';
import { base } from 'viem/chains';
import { parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { PaymentProof } from '@/lib/types/x402';
import { prisma } from '@/lib/db';

const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;

const USDC_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
]);

/**
 * Transfer fee to fee recipient wallet
 * 
 * Note: This requires a server-side wallet with private key
 * For production, use a secure key management solution
 */
export async function transferFeeToRecipient(
  proof: PaymentProof,
  feeAmount: string,
  feeRecipient: string
): Promise<string | null> {
  // Check if fee transfer is already completed
  const existingFee = await prisma.fee.findFirst({
    where: {
      transaction: {
        transactionHash: proof.transactionHash,
      },
      transferred: true,
    },
  });

  if (existingFee) {
    return existingFee.transferHash || null;
  }

  // Check if we have a server wallet configured
  const serverWalletPrivateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
  
  if (!serverWalletPrivateKey) {
    console.warn('SERVER_WALLET_PRIVATE_KEY not configured, skipping fee transfer');
    // Still mark as attempted (we'll retry later)
    await prisma.fee.updateMany({
      where: {
        transaction: {
          transactionHash: proof.transactionHash,
        },
        feeRecipient,
      },
      data: {
        transferred: false, // Will retry when wallet is configured
      },
    });
    return null;
  }

  try {
    // Create wallet client with private key
    const account = privateKeyToAccount(serverWalletPrivateKey as `0x${string}`);
    
    const walletClient = createWalletClient({
      chain: base,
      transport: http(),
      account,
    });

    // Convert fee amount to wei (USDC has 6 decimals)
    const feeInWei = parseUnits(formatUSDC(feeAmount), 6);
    
    console.log('[Fee Transfer] Transferring fee:', {
      recipient: feeRecipient,
      amount: formatUSDC(feeAmount),
      amountWei: feeInWei.toString(),
      transactionHash: proof.transactionHash,
      from: account.address,
    });
    
    // Transfer USDC fee to recipient
    const hash = await walletClient.writeContract({
      address: USDC_BASE_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [feeRecipient as `0x${string}`, feeInWei],
    });

    console.log('[Fee Transfer] Transfer successful:', {
      hash,
      recipient: feeRecipient,
      amount: formatUSDC(feeAmount),
    });

    // Update fee record in database
    await prisma.fee.updateMany({
      where: {
        transaction: {
          transactionHash: proof.transactionHash,
        },
        feeRecipient,
      },
      data: {
        transferHash: hash,
        transferred: true,
        transferredAt: new Date(),
      },
    });

    return hash;
  } catch (error: any) {
    console.error('[Fee Transfer] Transfer error:', error);
    
    // Mark as failed but don't throw - allow retry later
    await prisma.fee.updateMany({
      where: {
        transaction: {
          transactionHash: proof.transactionHash,
        },
        feeRecipient,
      },
      data: {
        transferred: false,
      },
    });
    
    throw error;
  }
}

/**
 * Format USDC amount for display
 */
function formatUSDC(amount: string): string {
  try {
    return formatUnits(BigInt(amount), 6);
  } catch {
    return amount;
  }
}

