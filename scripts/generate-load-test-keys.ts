/**
 * Generate 50 Private Keys for Load Testing
 * 
 * Generates secure private keys using viem's generatePrivateKey
 * Outputs them in .env.loadtest format
 * 
 * Usage:
 *   npm run generate-load-test-keys
 * 
 * IMPORTANT:
 *   - These are REAL private keys - keep them secure!
 *   - You need to fund each wallet with Base ETH and USDC
 *   - Never commit the generated keys to git
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';

const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const USDC_DECIMALS = 6;
const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const NUM_KEYS = 150; // Generate 150 new keys (you already have 50, total = 200)

/**
 * Generate private keys and output to console and file
 */
async function generateKeys() {
  console.log('=== Generating 150 Additional Private Keys for Load Testing ===\n');
  console.log('⚠️  WARNING: These are REAL private keys. Keep them secure!\n');
  console.log('📝 Note: You already have 50 keys. These 150 will be added (total: 200 wallets)\n');
  
  const keys: Array<{ index: number; privateKey: string; address: string }> = [];
  
  // Start from 51 since you already have keys 1-50
  let startIndex = 51;
  
  // Check existing keys to determine start index
  const existingKeys = loadExistingKeys();
  if (existingKeys.length > 0) {
    startIndex = existingKeys.length + 1;
    console.log(`Found ${existingKeys.length} existing keys. Starting from PRIVATE_KEY_${startIndex}\n`);
  }
  
  // Generate keys
  for (let i = 0; i < NUM_KEYS; i++) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const keyIndex = startIndex + i;
    keys.push({
      index: keyIndex,
      privateKey,
      address: account.address,
    });
    
    console.log(`Generated key ${i + 1}/${NUM_KEYS} (PRIVATE_KEY_${keyIndex}): ${account.address}`);
  }
  
  // Append to existing .env.loadtest or create new
  const outputFile = path.join(process.cwd(), '.env.loadtest');
  let envContent = '';
  
  // Read existing keys if file exists
  if (fs.existsSync(outputFile)) {
    envContent = fs.readFileSync(outputFile, 'utf-8');
    if (!envContent.endsWith('\n')) {
      envContent += '\n';
    }
  }
  
  // Append new keys
  const newKeysContent = keys
    .map(k => `PRIVATE_KEY_${k.index}=${k.privateKey}`)
    .join('\n');
  
  envContent += newKeysContent;
  
  // Write to file
  fs.writeFileSync(outputFile, envContent);
  console.log(`\n✅ Generated ${NUM_KEYS} additional private keys`);
  console.log(`✅ Appended to: ${outputFile}`);
  console.log(`✅ Total keys now: ${startIndex + NUM_KEYS - 1}\n`);
  
  // Display addresses for easy reference
  console.log(`📋 New Wallet Addresses:\n`);
  keys.forEach(k => {
    console.log(`Wallet ${k.index}: ${k.address}`);
  });
  
  console.log(`\n⚠️  IMPORTANT NEXT STEPS:`);
  console.log(`1. Fund each NEW wallet with:`);
  console.log(`   - Base ETH: Minimum 0.001 ETH (for gas)`);
  console.log(`   - USDC: Minimum 2.5 USDC (for 10 transactions × 0.25 USDC)`);
  console.log(`2. Total needed for 150 new wallets: ~0.15 ETH + 375 USDC`);
  console.log(`3. Never commit .env.loadtest to git (it's already gitignored)`);
  console.log(`4. Run: npm run load-test`);
  
  // Also append addresses to addresses file
  const addressesFile = path.join(process.cwd(), '.env.loadtest.addresses.txt');
  let addressesContent = '';
  if (fs.existsSync(addressesFile)) {
    addressesContent = fs.readFileSync(addressesFile, 'utf-8');
    if (!addressesContent.endsWith('\n')) {
      addressesContent += '\n';
    }
  }
  addressesContent += keys.map(k => `${k.index}. ${k.address}`).join('\n');
  fs.writeFileSync(addressesFile, addressesContent);
  console.log(`\n✅ Wallet addresses appended to: ${addressesFile}`);
}

/**
 * Load existing keys from .env.loadtest to determine next index
 */
function loadExistingKeys(): string[] {
  const outputFile = path.join(process.cwd(), '.env.loadtest');
  if (!fs.existsSync(outputFile)) {
    return [];
  }
  
  const content = fs.readFileSync(outputFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim().startsWith('PRIVATE_KEY_'));
  return lines;
}

// Run
generateKeys().catch(error => {
  console.error('Error generating keys:', error);
  process.exit(1);
});

