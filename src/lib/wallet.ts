/**
 * Wallet Integration Utilities for Base Network
 * 
 * Handles wallet connection, payment approval, and transaction signing
 */

import { createWalletClient, custom, parseUnits, formatUnits, parseAbi } from 'viem';
import { base } from 'viem/chains';

const BASE_CHAIN_ID = 8453;
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;

const USDC_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
]);

export interface WalletConnection {
  address: string;
  chainId: number;
  provider: any;
}

/**
 * Connect wallet (MetaMask, WalletConnect, etc.)
 */
export async function connectWallet(): Promise<WalletConnection | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet found. Please install MetaMask or another Web3 wallet.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Get chain ID
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    // Check if connected to Base
    if (parseInt(chainId, 16) !== BASE_CHAIN_ID) {
      // Try to switch to Base
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
        });
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    return {
      address: accounts[0],
      chainId: parseInt(chainId, 16),
      provider: window.ethereum,
    };
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    throw error;
  }
}

/**
 * Approve USDC spending
 */
export async function approveUSDC(
  wallet: WalletConnection,
  spender: string,
  amount: string
): Promise<string> {
  const client = createWalletClient({
    chain: base,
    transport: custom(wallet.provider),
  });

  // USDC has 6 decimals
  const amountWei = parseUnits(amount, 6);

  try {
    const hash = await client.writeContract({
      address: USDC_BASE_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, amountWei],
      account: wallet.address as `0x${string}`,
    });

    return hash;
  } catch (error: any) {
    console.error('USDC approval error:', error);
    throw error;
  }
}

/**
 * Transfer USDC
 */
export async function transferUSDC(
  wallet: WalletConnection,
  to: string,
  amount: string
): Promise<string> {
  const client = createWalletClient({
    chain: base,
    transport: custom(wallet.provider),
  });

  const amountWei = parseUnits(amount, 6);

  try {
    const hash = await client.writeContract({
      address: USDC_BASE_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, amountWei],
      account: wallet.address as `0x${string}`,
    });

    return hash;
  } catch (error: any) {
    console.error('USDC transfer error:', error);
    throw error;
  }
}

/**
 * Check USDC balance
 */
export async function getUSDCBalance(wallet: WalletConnection): Promise<string> {
  const client = createWalletClient({
    chain: base,
    transport: custom(wallet.provider),
  });

  try {
    const balance = await client.readContract({
      address: USDC_BASE_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [wallet.address as `0x${string}`],
    });

    return balance.toString();
  } catch (error: any) {
    console.error('Balance check error:', error);
    return '0';
  }
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(amount: string): string {
  try {
    return formatUnits(BigInt(amount), 6);
  } catch {
    return amount;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

