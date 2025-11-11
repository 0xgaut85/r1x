'use client';

import { useAccount, useWalletClient, usePublicClient, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { parseAbi } from 'viem';
import { useEffect, useState, useRef } from 'react';

const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;
const USDC_DECIMALS = 6;

const USDC_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
]);

/**
 * Detect Solana wallet connection (Phantom or Solflare)
 * Strictly verifies connection on mount and after refresh
 */
function useSolanaWallet() {
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);
  const [isSolanaConnected, setIsSolanaConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkSolanaWallet = () => {
      if (typeof window === 'undefined') return;

      const phantom = (window as any).phantom?.solana;
      const solflare = (window as any).solflare;

      const wallet = phantom || solflare;
      
      // Strict check: wallet must exist, be connected, AND have a valid publicKey
      if (wallet && wallet.isConnected && wallet.publicKey) {
        try {
          // Phantom publicKey is an object - use toBase58() method
          const addr = typeof wallet.publicKey.toBase58 === 'function' 
            ? wallet.publicKey.toBase58() 
            : wallet.publicKey.toString();
          
          // Validate address format (Solana addresses are base58, typically 32-44 chars)
          if (addr && addr.length >= 32 && addr.length <= 44) {
            // Debug: Log detected address
            if (process.env.NODE_ENV !== 'production') {
              console.log('[useSolanaWallet] Detected Solana address:', addr);
            }
            
            setSolanaAddress(addr);
            setIsSolanaConnected(true);
            setIsInitialized(true);
            return;
          }
        } catch (error) {
          console.warn('[useSolanaWallet] Error reading wallet address:', error);
        }
      }
      
      // Not connected or invalid state - clear everything
      setSolanaAddress(null);
      setIsSolanaConnected(false);
      setIsInitialized(true);
    };

    // On mount, always start disconnected to force reconnection
    setSolanaAddress(null);
    setIsSolanaConnected(false);
    
    // Small delay to ensure wallet extensions are loaded
    const initTimeout = setTimeout(() => {
      checkSolanaWallet();
    }, 100);

    // Listen for wallet events
    const handleAccountsChanged = () => { 
      checkSolanaWallet(); 
    };
    const handleConnect = () => { 
      checkSolanaWallet(); 
    };
    const handleDisconnect = () => {
      // Force update to disconnected state
      setSolanaAddress(null);
      setIsSolanaConnected(false);
    };

    const phantom = (window as any).phantom?.solana;
    const solflare = (window as any).solflare;

    if (phantom) {
      phantom.on('accountChanged', handleAccountsChanged);
      phantom.on('connect', handleConnect);
      phantom.on('disconnect', handleDisconnect);
    }

    if (solflare) {
      solflare.on('accountChanged', handleAccountsChanged);
      solflare.on('connect', handleConnect);
      solflare.on('disconnect', handleDisconnect);
    }

    // Poll for wallet connection (in case events don't fire)
    // Check more frequently initially, then less frequently
    const interval = setInterval(checkSolanaWallet, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initTimeout);
      if (phantom) {
        phantom.off('accountChanged', handleAccountsChanged);
        phantom.off('connect', handleConnect);
        phantom.off('disconnect', handleDisconnect);
      }
      if (solflare) {
        solflare.off('accountChanged', handleAccountsChanged);
        solflare.off('connect', handleConnect);
        solflare.off('disconnect', handleDisconnect);
      }
    };
  }, []);

  // Return connection state only after initialization
  // This prevents showing stale "connected" state on refresh
  return { 
    solanaAddress: isInitialized ? solanaAddress : null, 
    isSolanaConnected: isInitialized ? isSolanaConnected : false 
  };
}

/**
 * Disconnect Solana wallets (Phantom/Solflare) programmatically
 */
function disconnectSolanaWallets(): void {
  if (typeof window === 'undefined') return;

  try {
    const phantom = (window as any).phantom?.solana;
    const solflare = (window as any).solflare;

    // Disconnect Phantom if connected
    if (phantom && phantom.isConnected) {
      phantom.disconnect().catch((err: any) => {
        console.warn('[useWallet] Failed to disconnect Phantom:', err);
      });
    }

    // Disconnect Solflare if connected
    if (solflare && solflare.isConnected) {
      solflare.disconnect().catch((err: any) => {
        console.warn('[useWallet] Failed to disconnect Solflare:', err);
      });
    }
  } catch (error) {
    console.warn('[useWallet] Error disconnecting Solana wallets:', error);
  }
}

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { solanaAddress, isSolanaConnected } = useSolanaWallet();
  
  // Track previous EVM connection state to detect disconnection
  const prevEVMConnectedRef = useRef<boolean>(isConnected);

  // Listen for EVM disconnection and disconnect Solana wallets
  useEffect(() => {
    // Check if EVM was connected but is now disconnected
    if (prevEVMConnectedRef.current && !isConnected) {
      // EVM wallet was disconnected - also disconnect Solana wallets
      console.log('[useWallet] EVM wallet disconnected, disconnecting Solana wallets');
      disconnectSolanaWallets();
    }
    
    // Update previous state
    prevEVMConnectedRef.current = isConnected;
  }, [isConnected]);

  // Combined connection status: EVM OR Solana
  // Prefer EVM address when EVM is connected; otherwise fall back to Solana.
  // This avoids stale Solana address after switching to an EVM wallet (e.g., Rabby).
  const isAnyWalletConnected = isConnected || isSolanaConnected;
  const displayAddress = (isConnected && address) ? address : (isSolanaConnected ? solanaAddress : null);
  
  // Debug: Log display address to verify it's correct
  if (process.env.NODE_ENV !== 'production' && displayAddress) {
    console.log('[useWallet] Display address:', {
      displayAddress,
      isEVMConnected: isConnected,
      evmAddress: address,
      isSolanaConnected,
      solanaAddress,
    });
  }

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
