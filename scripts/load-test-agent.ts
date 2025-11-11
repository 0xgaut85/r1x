/**
 * Load Testing Script for /api/x402/pay Endpoint + Agent Endpoint
 * 
 * Sends sequential requests from 200 wallets:
 * - /api/x402/pay: 1 every 60 seconds (1 minute)
 * - /api/r1x-agent/chat: 1 every 120 seconds (2 minutes)
 * Each wallet performs 150 transactions (30k total)
 * Uses x402-fetch (same as frontend) for automatic payment handling
 * 
 * Usage:
 *   1. Create .env.loadtest file with PRIVATE_KEY_1=0x..., PRIVATE_KEY_2=0x..., etc.
 *   2. Run: npm run load-test
 */

import { createWalletClient, http, createPublicClient, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { wrapFetchWithPayment } from 'x402-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.loadtest
dotenv.config({ path: '.env.loadtest' });

// Configuration
const CONFIG = {
  ENDPOINT: process.env.LOAD_TEST_ENDPOINT || 'https://server.r1xlabs.com/api/x402/pay',
  AGENT_ENDPOINT: process.env.LOAD_TEST_AGENT_ENDPOINT || 'https://server.r1xlabs.com/api/r1x-agent/chat',
  SERVICE_ID: process.env.LOAD_TEST_SERVICE_ID || 'r1x-aggregator',
  SERVICE_NAME: process.env.LOAD_TEST_SERVICE_NAME || 'r1x Aggregator',
  INTERVAL_MS: parseInt(process.env.LOAD_TEST_INTERVAL_MS || '60000'), // 60 seconds (1 minute) between /pay requests
  AGENT_INTERVAL_MS: parseInt(process.env.LOAD_TEST_AGENT_INTERVAL_MS || '120000'), // 120 seconds (2 minutes) between agent requests
  MAX_PAYMENT_USDC: parseFloat(process.env.LOAD_TEST_MAX_PAYMENT_USDC || '0.01'), // $0.01 for /pay endpoint
  MAX_PAYMENT_USDC_AGENT: parseFloat(process.env.LOAD_TEST_MAX_PAYMENT_USDC_AGENT || '0.25'), // $0.25 for agent endpoint
  TRANSACTIONS_PER_WALLET: parseInt(process.env.LOAD_TEST_TXN_PER_WALLET || '150'), // 150 transactions per wallet (30k total)
  MIN_BASE_BALANCE_ETH: parseFloat(process.env.LOAD_TEST_MIN_BASE_BALANCE_ETH || '0.001'),
  MIN_USDC_BALANCE: parseFloat(process.env.LOAD_TEST_MIN_USDC_BALANCE || '0.5'),
  MESSAGE: process.env.LOAD_TEST_MESSAGE || 'Hello, this is a load test message.',
};

// Base network configuration
const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_DECIMALS = 6;

// Results directory
const RESULTS_DIR = path.join(__dirname, 'load-test-results');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const CSV_FILE = path.join(RESULTS_DIR, `load-test-${timestamp}.csv`);

// Statistics
interface RequestResult {
  timestamp: string;
  walletAddress: string;
  statusCode: number;
  success: boolean;
  errorMessage?: string;
  responseTimeMs: number;
  transactionHash?: string;
}

const stats = {
  totalRequests: 0,
  successful: 0,
  failed: 0,
  results: [] as RequestResult[],
};

/**
 * Load private keys from environment variables
 */
function loadPrivateKeys(): string[] {
  const keys: string[] = [];
  let index = 1;
  
  while (true) {
    const key = process.env[`PRIVATE_KEY_${index}`];
    if (!key) break;
    
    // Validate private key format
    if (!key.startsWith('0x') || key.length !== 66) {
      console.warn(`[Load Test] Invalid private key format for PRIVATE_KEY_${index}, skipping`);
      index++;
      continue;
    }
    
    keys.push(key);
    index++;
  }
  
  if (keys.length === 0) {
    throw new Error('No private keys found in .env.loadtest. Add PRIVATE_KEY_1=0x..., PRIVATE_KEY_2=0x..., etc.');
  }
  
  console.log(`[Load Test] Loaded ${keys.length} private keys`);
  return keys;
}

/**
 * Create wallet client from private key
 */
function createWalletClientFromKey(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http(BASE_RPC),
  });
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(BASE_RPC),
  });
  
  return { walletClient, publicClient, account };
}

/**
 * Check wallet balance (Base ETH and USDC)
 */
async function checkWalletBalance(
  publicClient: ReturnType<typeof createPublicClient>,
  address: `0x${string}`
): Promise<{ hasBaseETH: boolean; hasUSDC: boolean; baseBalance: string; usdcBalance: string }> {
  try {
    // Check Base ETH balance
    const baseBalanceWei = await publicClient.getBalance({ address });
    const baseBalanceEth = formatUnits(baseBalanceWei, 18);
    const hasBaseETH = parseFloat(baseBalanceEth) >= CONFIG.MIN_BASE_BALANCE_ETH;
    
    // Check USDC balance (ERC-20 token)
    const usdcBalance = await publicClient.readContract({
      address: USDC_BASE_ADDRESS,
      abi: [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        } as const,
      ] as const,
      functionName: 'balanceOf',
      args: [address],
    });
    
    const usdcBalanceFormatted = formatUnits(usdcBalance, USDC_DECIMALS);
    const hasUSDC = parseFloat(usdcBalanceFormatted) >= CONFIG.MIN_USDC_BALANCE;
    
    return {
      hasBaseETH,
      hasUSDC,
      baseBalance: baseBalanceEth,
      usdcBalance: usdcBalanceFormatted,
    };
  } catch (error: any) {
    console.error(`[Load Test] Error checking balance for ${address}:`, error.message);
    return {
      hasBaseETH: false,
      hasUSDC: false,
      baseBalance: '0',
      usdcBalance: '0',
    };
  }
}

/**
 * Send request to /api/x402/pay endpoint with x402-fetch payment handling
 */
async function sendPayRequest(
  walletClient: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
  walletAddress: string
): Promise<RequestResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Use x402-fetch exactly like the frontend does
    const fetchWithPayment = wrapFetchWithPayment(
      fetch as any,
      walletClient as any,
      BigInt(CONFIG.MAX_PAYMENT_USDC * 10 ** USDC_DECIMALS) // 0.01 USDC max for /pay endpoint
    );
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    let response: Response;
    try {
      response = await fetchWithPayment(CONFIG.ENDPOINT, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          serviceId: CONFIG.SERVICE_ID,
          serviceName: CONFIG.SERVICE_NAME,
        }),
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error(`Request timeout after 60 seconds`);
      }
      throw new Error(`Network error: ${fetchError.message || String(fetchError)}`);
    } finally {
      clearTimeout(timeoutId);
    }
    
    const responseTimeMs = Date.now() - startTime;
    const statusCode = response.status;
    const success = response.ok;
    
    // Extract transaction hash from payment response header if available
    const paymentResponseHeader = response.headers.get('x-payment-response') || 
                                  response.headers.get('X-Payment-Response');
    let transactionHash: string | undefined;
    
    if (paymentResponseHeader) {
      try {
        const receipt = JSON.parse(paymentResponseHeader);
        transactionHash = receipt.settlementHash || receipt.transaction || receipt.transactionHash;
      } catch {
        // Ignore parse errors
      }
    }
    
    // Get response body for error messages
    let errorMessage: string | undefined;
    if (!success) {
      try {
        const errorText = await response.text();
        errorMessage = errorText.substring(0, 200);
      } catch {
        errorMessage = `HTTP ${statusCode}`;
      }
    }
    
    return {
      timestamp,
      walletAddress,
      statusCode,
      success,
      errorMessage,
      responseTimeMs,
      transactionHash,
    };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;
    return {
      timestamp,
      walletAddress,
      statusCode: 0,
      success: false,
      errorMessage: error.message || String(error),
      responseTimeMs,
    };
  }
}

/**
 * Send request to /api/r1x-agent/chat endpoint with x402-fetch payment handling
 */
async function sendAgentRequest(
  walletClient: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
  walletAddress: string
): Promise<RequestResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Use x402-fetch exactly like the frontend does
    const fetchWithPayment = wrapFetchWithPayment(
      fetch as any,
      walletClient as any,
      BigInt(CONFIG.MAX_PAYMENT_USDC_AGENT * 10 ** USDC_DECIMALS) // 0.25 USDC max for agent endpoint
    );
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    let response: Response;
    try {
      response = await fetchWithPayment(CONFIG.AGENT_ENDPOINT, {
        signal: controller.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: CONFIG.MESSAGE }],
        }),
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error(`Request timeout after 60 seconds`);
      }
      throw new Error(`Network error: ${fetchError.message || String(fetchError)}`);
    } finally {
      clearTimeout(timeoutId);
    }
    
    const responseTimeMs = Date.now() - startTime;
    const statusCode = response.status;
    const success = response.ok;
    
    // Extract transaction hash from payment response header if available
    const paymentResponseHeader = response.headers.get('x-payment-response') || 
                                  response.headers.get('X-Payment-Response');
    let transactionHash: string | undefined;
    
    if (paymentResponseHeader) {
      try {
        const receipt = JSON.parse(paymentResponseHeader);
        transactionHash = receipt.settlementHash || receipt.transaction || receipt.transactionHash;
      } catch {
        // Ignore parse errors
      }
    }
    
    // Get response body for error messages
    let errorMessage: string | undefined;
    if (!success) {
      try {
        const errorText = await response.text();
        errorMessage = errorText.substring(0, 200);
      } catch {
        errorMessage = `HTTP ${statusCode}`;
      }
    }
    
    return {
      timestamp,
      walletAddress,
      statusCode,
      success,
      errorMessage,
      responseTimeMs,
      transactionHash,
    };
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;
    return {
      timestamp,
      walletAddress,
      statusCode: 0,
      success: false,
      errorMessage: error.message || String(error),
      responseTimeMs,
    };
  }
}

/**
 * Write result to CSV file
 */
function writeResultToCSV(result: RequestResult) {
  // Create results directory if it doesn't exist
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  
  // Write header if file is new
  const fileExists = fs.existsSync(CSV_FILE);
  if (!fileExists) {
    const header = 'timestamp,wallet_address,status_code,success,error_message,response_time_ms,transaction_hash\n';
    fs.writeFileSync(CSV_FILE, header);
  }
  
  // Append result
  const row = [
    result.timestamp,
    result.walletAddress,
    result.statusCode,
    result.success,
    result.errorMessage || '',
    result.responseTimeMs,
    result.transactionHash || '',
  ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
  
  fs.appendFileSync(CSV_FILE, row);
}

/**
 * Print summary statistics
 */
function printSummary() {
  const successRate = stats.totalRequests > 0 
    ? ((stats.successful / stats.totalRequests) * 100).toFixed(2)
    : '0.00';
  
  console.log('\n=== Load Test Summary ===');
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log(`Results saved to: ${CSV_FILE}`);
  
  if (stats.results.length > 0) {
    const avgResponseTime = stats.results.reduce((sum, r) => sum + r.responseTimeMs, 0) / stats.results.length;
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('=== r1x Load Test (/api/x402/pay + /api/r1x-agent/chat) ===');
  console.log(`Pay Endpoint: ${CONFIG.ENDPOINT}`);
  console.log(`Agent Endpoint: ${CONFIG.AGENT_ENDPOINT}`);
  console.log(`Pay Interval: ${CONFIG.INTERVAL_MS / 1000} seconds`);
  console.log(`Agent Interval: ${CONFIG.AGENT_INTERVAL_MS / 1000} seconds`);
  console.log(`Service ID: ${CONFIG.SERVICE_ID}`);
  console.log(`Service Name: ${CONFIG.SERVICE_NAME}`);
  console.log(`Max Payment (Pay): ${CONFIG.MAX_PAYMENT_USDC} USDC`);
  console.log(`Max Payment (Agent): ${CONFIG.MAX_PAYMENT_USDC_AGENT} USDC`);
  console.log(`Transactions per wallet: ${CONFIG.TRANSACTIONS_PER_WALLET}`);
  console.log('');
  
  // Load private keys
  const privateKeys = loadPrivateKeys();
  
  // Create wallet clients (skip balance check - assuming all wallets are funded)
  console.log('[Load Test] Creating wallet clients...');
  const wallets: Array<{
    walletClient: any;
    publicClient: any;
    address: `0x${string}`;
  }> = [];
  
  for (let i = 0; i < privateKeys.length; i++) {
    const privateKey = privateKeys[i] as `0x${string}`;
    const { walletClient, publicClient, account } = createWalletClientFromKey(privateKey);
    
    wallets.push({
      walletClient,
      publicClient,
      address: account.address,
    });
  }
  
  console.log(`[Load Test] ${wallets.length} wallets ready`);
  
  // Test endpoint connectivity
  console.log(`[Load Test] Testing endpoint connectivity: ${CONFIG.ENDPOINT}`);
  try {
    const testResponse = await fetch(CONFIG.ENDPOINT, {
      method: 'OPTIONS',
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      // Try HEAD as fallback
      return fetch(CONFIG.ENDPOINT, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
    });
    console.log(`[Load Test] Endpoint reachable (status: ${testResponse.status})`);
  } catch (error: any) {
    console.error(`[Load Test] ⚠️  WARNING: Cannot reach endpoint: ${error.message}`);
    console.error(`[Load Test] Please check:`);
    console.error(`  1. Endpoint URL is correct: ${CONFIG.ENDPOINT}`);
    console.error(`  2. Network connectivity`);
    console.error(`  3. Firewall/proxy settings`);
    console.error(`[Load Test] Continuing anyway...\n`);
  }
  
  console.log(`[Load Test] Starting load test... Press Ctrl+C to stop\n`);
  
  // Setup graceful shutdown
  let isRunning = true;
  process.on('SIGINT', () => {
    console.log('\n[Load Test] Stopping load test...');
    isRunning = false;
    printSummary();
    process.exit(0);
  });
  
  // Sequential execution: send 1 wallet request every 60 seconds (1 minute) for /pay
  // Also send 1 agent request every 120 seconds (2 minutes)
  // Each wallet does exactly TRANSACTIONS_PER_WALLET transactions
  let requestCount = 0;
  let agentRequestCount = 0;
  let walletIndex = 0;
  let agentWalletIndex = 0;
  const walletTxCounts = new Map<string, number>(); // Track transactions per wallet
  
  // Initialize transaction counts for all wallets
  wallets.forEach(w => {
    walletTxCounts.set(w.address, 0);
  });
  
  // Start agent request interval (every 120 seconds / 2 minutes)
  const agentInterval = setInterval(async () => {
    if (!isRunning) {
      clearInterval(agentInterval);
      return;
    }
    
    const wallet = wallets[agentWalletIndex];
    agentRequestCount++;
    
    console.log(`[Agent] Request ${agentRequestCount} - Wallet ${agentWalletIndex + 1}/${wallets.length}: ${wallet.address.substring(0, 10)}...`);
    
    try {
      const result = await sendAgentRequest(wallet.walletClient, wallet.publicClient, wallet.address);
      
      stats.totalRequests++;
      if (result.success) {
        stats.successful++;
        console.log(`  ✓ Agent Success - ${result.statusCode} (${result.responseTimeMs}ms)`);
      } else {
        stats.failed++;
        console.log(`  ✗ Agent Failed - ${result.statusCode} - ${result.errorMessage?.substring(0, 50)}`);
      }
      stats.results.push(result);
      writeResultToCSV(result);
    } catch (error: any) {
      stats.totalRequests++;
      stats.failed++;
      const result: RequestResult = {
        timestamp: new Date().toISOString(),
        walletAddress: wallet.address,
        statusCode: 0,
        success: false,
        errorMessage: `Agent: ${error.message || String(error)}`,
        responseTimeMs: 0,
      };
      stats.results.push(result);
      writeResultToCSV(result);
      console.log(`  ✗ Agent Error: ${error.message}`);
    }
    
    // Move to next wallet for agent requests
    agentWalletIndex = (agentWalletIndex + 1) % wallets.length;
  }, CONFIG.AGENT_INTERVAL_MS);
  
  // Main loop: /pay endpoint requests every 60 seconds (1 minute)
  while (isRunning) {
    const wallet = wallets[walletIndex];
    const walletTxCount = walletTxCounts.get(wallet.address) || 0;
    
    // Skip wallet if it has reached its transaction limit
    if (walletTxCount >= CONFIG.TRANSACTIONS_PER_WALLET) {
      walletIndex = (walletIndex + 1) % wallets.length;
      
      // Check if all wallets are done
      const allDone = Array.from(walletTxCounts.values()).every(count => count >= CONFIG.TRANSACTIONS_PER_WALLET);
      if (allDone) {
        console.log(`\n[Load Test] ✅ All wallets completed ${CONFIG.TRANSACTIONS_PER_WALLET} transactions each!`);
        clearInterval(agentInterval);
        break;
      }
      continue;
    }
    
    requestCount++;
    
    console.log(`[Pay] Request ${requestCount} - Wallet ${walletIndex + 1}/${wallets.length}: ${wallet.address.substring(0, 10)}... (${walletTxCount + 1}/${CONFIG.TRANSACTIONS_PER_WALLET})`);
    
    try {
      const result = await sendPayRequest(wallet.walletClient, wallet.publicClient, wallet.address);
      
      stats.totalRequests++;
      if (result.success) {
        stats.successful++;
        walletTxCounts.set(wallet.address, walletTxCount + 1);
        console.log(`  ✓ Pay Success - ${result.statusCode} (${result.responseTimeMs}ms)`);
      } else {
        stats.failed++;
        console.log(`  ✗ Pay Failed - ${result.statusCode} - ${result.errorMessage?.substring(0, 50)}`);
      }
      stats.results.push(result);
      writeResultToCSV(result);
    } catch (error: any) {
      stats.totalRequests++;
      stats.failed++;
      const result: RequestResult = {
        timestamp: new Date().toISOString(),
        walletAddress: wallet.address,
        statusCode: 0,
        success: false,
        errorMessage: `Pay: ${error.message || String(error)}`,
        responseTimeMs: 0,
      };
      stats.results.push(result);
      writeResultToCSV(result);
      console.log(`  ✗ Pay Error: ${error.message}`);
    }
    
    // Move to next wallet (cycle through all wallets)
    walletIndex = (walletIndex + 1) % wallets.length;
    
    // Print stats every 10 requests
    if (requestCount % 10 === 0) {
      const successRate = stats.totalRequests > 0 
        ? ((stats.successful / stats.totalRequests) * 100).toFixed(2)
        : '0.00';
      const completedWallets = Array.from(walletTxCounts.values()).filter(count => count >= CONFIG.TRANSACTIONS_PER_WALLET).length;
      console.log(`[Load Test] Stats: ${stats.successful}/${stats.totalRequests} successful (${successRate}%) | ${completedWallets}/${wallets.length} wallets completed | Agent: ${agentRequestCount} requests\n`);
    }
    
    // Wait before next request (using configured interval)
    if (isRunning) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.INTERVAL_MS));
    }
  }
  
  // Cleanup agent interval on exit
  clearInterval(agentInterval);
}

// Run main function
main().catch(error => {
  console.error('[Load Test] Fatal error:', error);
  printSummary();
  process.exit(1);
});

