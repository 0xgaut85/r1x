/**
 * List all wallet addresses from .env.loadtest
 */

import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.loadtest
dotenv.config({ path: '.env.loadtest' });

function loadPrivateKeys(): Array<{ index: number; privateKey: string; address: string }> {
  const wallets: Array<{ index: number; privateKey: string; address: string }> = [];
  let index = 1;
  
  while (true) {
    const key = process.env[`PRIVATE_KEY_${index}`];
    if (!key) break;
    
    // Validate private key format
    if (!key.startsWith('0x') || key.length !== 66) {
      console.warn(`Invalid private key format for PRIVATE_KEY_${index}, skipping`);
      index++;
      continue;
    }
    
    try {
      const account = privateKeyToAccount(key as `0x${string}`);
      wallets.push({
        index,
        privateKey: key,
        address: account.address,
      });
    } catch (error: any) {
      console.warn(`Error processing PRIVATE_KEY_${index}: ${error.message}`);
    }
    
    index++;
  }
  
  return wallets;
}

async function main() {
  console.log('Loading wallets from .env.loadtest...\n');
  
  const wallets = loadPrivateKeys();
  
  if (wallets.length === 0) {
    console.error('No wallets found in .env.loadtest');
    process.exit(1);
  }
  
  console.log(`Found ${wallets.length} wallets:\n`);
  console.log('Index | Address');
  console.log('------|' + '-'.repeat(44));
  
  wallets.forEach(w => {
    console.log(`${String(w.index).padStart(5)} | ${w.address}`);
  });
  
  console.log(`\nTotal: ${wallets.length} wallets`);
  
  // Also output as comma-separated list
  console.log('\n--- Comma-separated addresses ---');
  console.log(wallets.map(w => w.address).join(', '));
  
  // Output as JSON array
  console.log('\n--- JSON array ---');
  console.log(JSON.stringify(wallets.map(w => w.address), null, 2));
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});



