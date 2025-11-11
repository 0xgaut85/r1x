/**
 * Generate 200 New Private Keys for Load Testing
 * 
 * Generates secure private keys using viem's generatePrivateKey
 * Outputs them in .env.loadtest format and provides funding lists
 * 
 * Usage:
 *   npm run generate-new-wallets
 * 
 * IMPORTANT:
 *   - These are REAL private keys - keep them secure!
 *   - You need to fund each wallet with Base ETH and USDC
 *   - Never commit the generated keys to git
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';
import * as path from 'path';

const NUM_KEYS = 200; // Generate 200 new wallets

/**
 * Generate private keys and output to console and file
 */
async function generateKeys() {
  console.log('=== Generating 200 New Private Keys for Load Testing ===\n');
  console.log('⚠️  WARNING: These are REAL private keys. Keep them secure!\n');
  
  const keys: Array<{ index: number; privateKey: string; address: string }> = [];
  
  // Generate keys
  for (let i = 0; i < NUM_KEYS; i++) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const keyIndex = i + 1;
    keys.push({
      index: keyIndex,
      privateKey,
      address: account.address,
    });
    
    if ((i + 1) % 50 === 0) {
      console.log(`Generated ${i + 1}/${NUM_KEYS} wallets...`);
    }
  }
  
  console.log(`\n✅ Generated ${NUM_KEYS} private keys\n`);
  
  // Write to .env.loadtest (overwrite existing)
  const outputFile = path.join(process.cwd(), '.env.loadtest');
  const envContent = keys
    .map(k => `PRIVATE_KEY_${k.index}=${k.privateKey}`)
    .join('\n');
  
  fs.writeFileSync(outputFile, envContent);
  console.log(`✅ Saved private keys to: ${outputFile}\n`);
  
  // Generate ETH funding list (addresses with ", 0.0002")
  const ethFundingList = keys
    .map(k => `${k.address}, 0.0002`)
    .join('\n');
  
  // Generate USDC funding list (addresses with ", 2")
  const usdcFundingList = keys
    .map(k => `${k.address}, 2`)
    .join('\n');
  
  // Save to files
  const ethListFile = path.join(process.cwd(), 'wallet-funding-eth.txt');
  const usdcListFile = path.join(process.cwd(), 'wallet-funding-usdc.txt');
  
  fs.writeFileSync(ethListFile, ethFundingList);
  fs.writeFileSync(usdcListFile, usdcFundingList);
  
  console.log('=== ETH Funding List (0.0002 ETH per wallet) ===');
  console.log(ethFundingList);
  console.log('\n');
  
  console.log('=== USDC Funding List (2 USDC per wallet) ===');
  console.log(usdcFundingList);
  console.log('\n');
  
  console.log(`✅ ETH funding list saved to: ${ethListFile}`);
  console.log(`✅ USDC funding list saved to: ${usdcListFile}\n`);
  
  console.log('⚠️  IMPORTANT NEXT STEPS:');
  console.log(`1. Fund each wallet with:`);
  console.log(`   - Base ETH: 0.0002 ETH per wallet`);
  console.log(`   - USDC: 2 USDC per wallet`);
  console.log(`2. Total needed for 200 wallets:`);
  console.log(`   - ETH: 0.04 ETH (200 × 0.0002)`);
  console.log(`   - USDC: 400 USDC (200 × 2)`);
  console.log(`3. Never commit .env.loadtest to git (it's already gitignored)`);
  console.log(`4. Run: npm run load-test`);
}

// Run
generateKeys().catch(error => {
  console.error('Error generating keys:', error);
  process.exit(1);
});



