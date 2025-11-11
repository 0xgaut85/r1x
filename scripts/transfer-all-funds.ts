/**
 * Transfer all USDC and ETH from all wallets to a target address
 * 
 * Usage:
 *   npm run transfer-funds
 * 
 * Or set TARGET_ADDRESS env var:
 *   TARGET_ADDRESS=0x... npm run transfer-funds
 */

import { createWalletClient, http, createPublicClient, formatUnits, parseUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

// Load environment variables from .env.loadtest
dotenv.config({ path: '.env.loadtest' });

// Configuration
const TARGET_ADDRESS = (process.env.TARGET_ADDRESS || '0xA05EDA7D76CB704fa4dF2D60455552441dAFf538') as `0x${string}`;
const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;
const MIN_ETH_FOR_GAS = parseUnits('0.0001', ETH_DECIMALS); // Keep 0.0001 ETH for gas
const PARALLEL_BATCH_SIZE = parseInt(process.env.PARALLEL_BATCH_SIZE || '5'); // Process 5 wallets in parallel (reduced to avoid rate limits)
const BATCH_DELAY_MS = parseInt(process.env.BATCH_DELAY_MS || '2000'); // 2 second delay between batches

// USDC ERC-20 ABI (transfer function)
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * Load private keys from environment variables
 */
function loadPrivateKeys(): string[] {
  const keys: string[] = [];
  let index = 1;
  
  while (true) {
    const key = process.env[`PRIVATE_KEY_${index}`];
    if (!key) break;
    
    if (!key.startsWith('0x') || key.length !== 66) {
      console.warn(`Invalid private key format for PRIVATE_KEY_${index}, skipping`);
      index++;
      continue;
    }
    
    keys.push(key);
    index++;
  }
  
  return keys;
}

/**
 * Get wallet balances
 */
async function getBalances(
  publicClient: ReturnType<typeof createPublicClient>,
  address: `0x${string}`
): Promise<{ eth: bigint; usdc: bigint }> {
  const ethBalance = await publicClient.getBalance({ address });
  
  const usdcBalance = await publicClient.readContract({
    address: USDC_BASE_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
  
  return { eth: ethBalance, usdc: usdcBalance };
}

/**
 * Transfer USDC
 */
async function transferUSDC(
  walletClient: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
  fromAddress: `0x${string}`,
  toAddress: `0x${string}`,
  amount: bigint
): Promise<string> {
  const hash = await walletClient.writeContract({
    chain: base,
    address: USDC_BASE_ADDRESS,
    abi: USDC_ABI,
    functionName: 'transfer',
    args: [toAddress, amount],
    account: walletClient.account!,
  });
  
  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.transactionHash;
}

/**
 * Transfer ETH
 */
async function transferETH(
  walletClient: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
  toAddress: `0x${string}`,
  amount: bigint
): Promise<string> {
  const hash = await walletClient.sendTransaction({
    chain: base,
    to: toAddress,
    value: amount,
  });
  
  // Wait for transaction receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.transactionHash;
}

/**
 * Process a single wallet
 */
async function processWallet(
  privateKey: string,
  index: number,
  total: number
): Promise<{ usdcTransferred: boolean; ethTransferred: boolean; errors: string[] }> {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const address = account.address;
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC),
  });
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(BASE_RPC),
  });
  
  const errors: string[] = [];
  let usdcTransferred = false;
  let ethTransferred = false;
  
  try {
    // Get balances
    const balances = await getBalances(publicClient, address);
    const ethFormatted = formatUnits(balances.eth, ETH_DECIMALS);
    const usdcFormatted = formatUnits(balances.usdc, USDC_DECIMALS);
    
    // Only log if there's something to transfer
    if (balances.usdc > 0n || balances.eth > MIN_ETH_FOR_GAS) {
      console.log(`[${index}/${total}] ${address} - ETH: ${ethFormatted}, USDC: ${usdcFormatted}`);
    }
    
    // Transfer USDC if balance > 0
    if (balances.usdc > 0n) {
      try {
        const txHash = await transferUSDC(walletClient, publicClient, address, TARGET_ADDRESS, balances.usdc);
        console.log(`  ✓ [${index}] USDC: ${usdcFormatted} → ${txHash.substring(0, 10)}...`);
        usdcTransferred = true;
      } catch (error: any) {
        const errorMsg = `USDC transfer failed: ${error.message}`;
        console.error(`  ✗ [${index}] USDC failed: ${error.message}`);
        errors.push(errorMsg);
      }
    }
    
    // Transfer ETH (keep MIN_ETH_FOR_GAS for gas)
    if (balances.eth > MIN_ETH_FOR_GAS) {
      const amountToTransfer = balances.eth - MIN_ETH_FOR_GAS;
      try {
        const txHash = await transferETH(walletClient, publicClient, TARGET_ADDRESS, amountToTransfer);
        console.log(`  ✓ [${index}] ETH: ${formatUnits(amountToTransfer, ETH_DECIMALS)} → ${txHash.substring(0, 10)}...`);
        ethTransferred = true;
      } catch (error: any) {
        const errorMsg = `ETH transfer failed: ${error.message}`;
        console.error(`  ✗ [${index}] ETH failed: ${error.message}`);
        errors.push(errorMsg);
      }
    }
    
  } catch (error: any) {
    const errorMsg = `Wallet processing failed: ${error.message}`;
    console.error(`  ✗ ${errorMsg}`);
    errors.push(errorMsg);
  }
  
  return { usdcTransferred, ethTransferred, errors };
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Transfer All Funds ===');
  console.log(`Target Address: ${TARGET_ADDRESS}`);
  console.log(`Network: Base (${BASE_RPC})`);
  console.log('');
  
  const privateKeys = loadPrivateKeys();
  
  if (privateKeys.length === 0) {
    console.error('No private keys found in .env.loadtest');
    process.exit(1);
  }
  
  console.log(`Found ${privateKeys.length} wallets`);
  console.log(`Processing ${PARALLEL_BATCH_SIZE} wallets per batch with ${BATCH_DELAY_MS}ms delay between batches\n`);
  
  console.log('Starting transfers...\n');
  
  const results = {
    total: privateKeys.length,
    processed: 0,
    usdcTransfers: 0,
    ethTransfers: 0,
    errors: 0,
    allErrors: [] as string[],
  };
  
  // Process wallets in parallel batches for speed
  for (let i = 0; i < privateKeys.length; i += PARALLEL_BATCH_SIZE) {
    const batch = privateKeys.slice(i, i + PARALLEL_BATCH_SIZE);
    const batchPromises = batch.map((key, batchIndex) => 
      processWallet(key, i + batchIndex + 1, privateKeys.length)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, batchIndex) => {
      if (result.status === 'fulfilled') {
        const walletResult = result.value;
        results.processed++;
        if (walletResult.usdcTransferred) results.usdcTransfers++;
        if (walletResult.ethTransferred) results.ethTransfers++;
        if (walletResult.errors.length > 0) {
          results.errors++;
          results.allErrors.push(...walletResult.errors.map(e => `Wallet ${i + batchIndex + 1}: ${e}`));
        }
      } else {
        results.errors++;
        results.allErrors.push(`Wallet ${i + batchIndex + 1}: ${result.reason?.message || String(result.reason)}`);
      }
    });
    
    // Show progress
    console.log(`\nProgress: ${Math.min(i + PARALLEL_BATCH_SIZE, privateKeys.length)}/${privateKeys.length} wallets processed`);
    
    // Delay between batches to avoid rate limits
    if (i + PARALLEL_BATCH_SIZE < privateKeys.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
  
  // Summary
  console.log('\n=== Transfer Summary ===');
  console.log(`Total Wallets: ${results.total}`);
  console.log(`Processed: ${results.processed}`);
  console.log(`USDC Transfers: ${results.usdcTransfers}`);
  console.log(`ETH Transfers: ${results.ethTransfers}`);
  console.log(`Errors: ${results.errors}`);
  
  if (results.allErrors.length > 0) {
    console.log('\nErrors:');
    results.allErrors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log(`\n✓ All transfers completed!`);
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

