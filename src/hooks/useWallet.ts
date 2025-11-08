'use client';

import { useAccount, useWalletClient, usePublicClient, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { parseAbi } from 'viem';
import { useEffect, useState } from 'react';

const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;
const USDC_DECIMALS = 6;

const USDC_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
]);

/**
 * Detect Solana wallet connection (Phantom or Solflare)
 */
function useSolanaWallet() {
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [isSolanaConnected, setIsSolanaConnected] = useState(false);

  useEffect(() => {
    const checkSolanaWallet = () => {
      if (typeof window === 'undefined') return;

      const phantom = (window as any).phantom?.solana;
      const solflare = (window as any).solflare;

      const wallet = phantom || solflare;
      
      if (wallet && wallet.isConnected && wallet.publicKey) {
        setSolanaAddress(wallet.publicKey.toString());
        setIsSolanaConnected(true);
      } else {
        setSolanaAddress(null);
        setIsSolanaConnected(false);
      }
    };

    // Check immediately
    checkSolanaWallet();

    // Listen for wallet events
    const handleAccountsChanged = () => {
      checkSolanaWallet();
    };

    const phantom = (window as any).phantom?.solana;
    const solflare = (window as any).solflare;

    if (phantom) {
      phantom.on('accountChanged', handleAccountsChanged);
      phantom.on('connect', handleAccountsChanged);
      phantom.on('disconnect', () => {
        setSolanaAddress(null);
        setIsSolanaConnected(false);
      });
    }

    if (solflare) {
      solflare.on('accountChanged', handleAccountsChanged);
      solflare.on('connect', handleAccountsChanged);
      solflare.on('disconnect', () => {
        setSolanaAddress(null);
        setIsSolanaConnected(false);
      });
    }

    // Poll for wallet connection (in case events don't fire)
    const interval = setInterval(checkSolanaWallet, 1000);

    return () => {
      clearInterval(interval);
      if (phantom) {
        phantom.off('accountChanged', handleAccountsChanged);
        phantom.off('connect', handleAccountsChanged);
        phantom.off('disconnect');
      }
      if (solflare) {
        solflare.off('accountChanged', handleAccountsChanged);
        solflare.off('connect', handleAccountsChanged);
        solflare.off('disconnect');
      }
    };
  }, []);

  return { solanaAddress, isSolanaConnected };
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { solanaAddress, isSolanaConnected } = useSolanaWallet();

  // Combined connection status: EVM OR Solana
  const isAnyWalletConnected = isConnected || isSolanaConnected;
  // Prefer Solana address if connected, otherwise EVM address
  const displayAddress = solanaAddress || address;

  const transferUSDC = async (to: string, amount: string): Promise<string> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (chainId !== base.id) {
      throw new Error('Please switch to Base network');
    }

    const amountWei = parseUnits(amount, USDC_DECIMALS);

    try {
      const hash = await walletClient.writeContract({
        address: USDC_BASE_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, amountWei],
      });

      return hash;
    } catch (error: any) {
      console.error('USDC transfer error:', error);
      throw error;
    }
  };

  const getUSDCBalance = async (): Promise<string> => {
    if (!publicClient || !address) {
      return '0';
    }

    try {
      const balance = await publicClient.readContract({
        address: USDC_BASE_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      });

      return formatUnits(balance, USDC_DECIMALS);
    } catch (error) {
      console.error('Balance check error:', error);
      return '0';
    }
  };

  const formatUSDC = (amount: string): string => {
    try {
      return formatUnits(BigInt(amount), USDC_DECIMALS);
    } catch {
      return amount;
    }
  };

  return {
    address: displayAddress, // Return Solana address if connected, otherwise EVM address
    isConnected: isAnyWalletConnected, // Return true if either EVM or Solana is connected
    chainId,
    walletClient, // Expose walletClient for x402-fetch
    transferUSDC,
    getUSDCBalance,
    formatUSDC,
    // Expose Solana-specific info
    solanaAddress,
    isSolanaConnected,
    isEVMConnected: isConnected,
    evmAddress: address,
  };
}
