import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';
import { getSolanaRpcUrl } from '@/lib/solana-rpc-config';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const R1X_MINT = '5DDYWuhWN8PDgNyu9Khgmqt4AkJmtAZarFBKah4Epump';
const STAKING_ADDRESS = 'HdjRVLjPNpkayysqTsKo1oYBHwzLHAVmgp6uLVH4Sk4Q';
const UNSTAKE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Complete unstake - transfer tokens back to user
 * POST /api/staking/unstake/complete
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userAddress } = body;

  if (!userAddress) {
    return NextResponse.json(
      { error: 'userAddress is required' },
      { status: 400 }
    );
  }

  // Check if server wallet is configured
  const serverStakingWalletPrivateKey = process.env.SERVER_STAKING_WALLET_PRIVATE_KEY;
  if (!serverStakingWalletPrivateKey) {
    return NextResponse.json(
      { error: 'Server staking wallet not configured. Set SERVER_STAKING_WALLET_PRIVATE_KEY in Railway.' },
      { status: 500 }
    );
  }

  try {
    // Prefer Prisma Model when available; fall back to raw SQL when not
    let staking: {
      id: string;
      userAddress: string;
      stakedAmount: string;
      status: string;
      unstakeRequestedAt: Date | null;
    } | null = null;

    // @ts-ignore - model may not exist on some generated clients
    if ((prisma as any).staking?.findUnique) {
      // @ts-ignore
      staking = await (prisma as any).staking.findUnique({
        where: { userAddress },
      });
    } else {
      // Raw SQL fallback
      const rows = (await prisma.$queryRaw`
        SELECT
          "id", "userAddress", "stakedAmount", "status", "unstakeRequestedAt"
        FROM "Staking"
        WHERE "userAddress" = ${userAddress}
        LIMIT 1
      `) as Array<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        status: string;
        unstakeRequestedAt: Date | null;
      }>;
      staking = rows?.[0] ?? null;
    }

    if (!staking || staking.status !== 'unstaking') {
      return NextResponse.json(
        { error: 'No active unstake request found' },
        { status: 400 }
      );
    }

    // Verify cooldown has passed
    if (!staking.unstakeRequestedAt) {
      return NextResponse.json(
        { error: 'Invalid unstake request' },
        { status: 400 }
      );
    }

    const timeElapsed = Date.now() - staking.unstakeRequestedAt.getTime();
    if (timeElapsed < UNSTAKE_COOLDOWN_MS) {
      const remainingMs = UNSTAKE_COOLDOWN_MS - timeElapsed;
      return NextResponse.json({
        error: 'Cooldown period not yet completed',
        remainingMs,
        canUnstake: false,
      });
    }

    // Get RPC URL
    const rpcUrl = await getSolanaRpcUrl();
    const connection = new Connection(rpcUrl, 'confirmed');

    // Create server wallet from private key
    // Private key should be base58 string or array of numbers
    let serverKeypair: Keypair;
    try {
      const privateKeyArray = JSON.parse(serverStakingWalletPrivateKey);
      serverKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    } catch {
      // Try as base58 string
      const secretKey = bs58.decode(serverStakingWalletPrivateKey);
      serverKeypair = Keypair.fromSecretKey(secretKey);
    }

    const stakingPubkey = new PublicKey(STAKING_ADDRESS);
    const userPubkey = new PublicKey(userAddress);
    const mintPubkey = new PublicKey(R1X_MINT);

    // Verify server wallet matches staking address
    if (!serverKeypair.publicKey.equals(stakingPubkey)) {
      return NextResponse.json(
        { error: 'Server wallet does not match staking address' },
        { status: 500 }
      );
    }

    // Get token accounts
    const stakingTokenAccount = await getAssociatedTokenAddress(mintPubkey, stakingPubkey);
    const userTokenAccount = await getAssociatedTokenAddress(mintPubkey, userPubkey);

    // Check staking account balance
    const stakingAccount = await getAccount(connection, stakingTokenAccount);
    const stakedAmountAtomic = BigInt(staking.stakedAmount) * BigInt(1_000_000); // Convert to atomic units

    if (stakingAccount.amount < stakedAmountAtomic) {
      return NextResponse.json(
        { error: 'Insufficient balance in staking account' },
        { status: 500 }
      );
    }

    // Create transfer transaction
    const transaction = new Transaction();
    transaction.add(
      createTransferInstruction(
        stakingTokenAccount,
        userTokenAccount,
        stakingPubkey,
        stakedAmountAtomic,
        []
      )
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = stakingPubkey;

    // Sign transaction
    transaction.sign(serverKeypair);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      { skipPreflight: false }
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // Update database
    // @ts-ignore - model may not exist on some generated clients
    if ((prisma as any).staking?.update) {
      // @ts-ignore
      await (prisma as any).staking.update({
        where: { userAddress },
        data: {
          status: 'unstaked',
          unstakeCompletedAt: new Date(),
          stakedAmount: '0',
        },
      });
    } else {
      // Raw SQL fallback
      await prisma.$executeRaw`
        UPDATE "Staking"
        SET
          "status" = 'unstaked',
          "unstakeCompletedAt" = NOW(),
          "stakedAmount" = '0',
          "updatedAt" = NOW()
        WHERE "userAddress" = ${userAddress}
      `;
    }

    return NextResponse.json({
      success: true,
      signature,
      unstakeCompletedAt: new Date(),
    });
  } catch (error: any) {
    console.error('[Unstake Complete] Error:', error);
    
    // Check if it's a migration/database schema issue - create table if missing
    if (error.message?.includes('does not exist') || error.code === 'P2010' || error.meta?.code === '42P01') {
      console.log('[Unstake Complete] Staking table does not exist, attempting to create it...');
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Staking" (
            "id" TEXT NOT NULL,
            "userAddress" TEXT NOT NULL,
            "stakedAmount" TEXT NOT NULL,
            "unstakeRequestedAt" TIMESTAMP(3),
            "unstakeCompletedAt" TIMESTAMP(3),
            "status" TEXT NOT NULL DEFAULT 'staked',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Staking_pkey" PRIMARY KEY ("id")
          )
        `;
        await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Staking_userAddress_key" ON "Staking"("userAddress")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Staking_userAddress_idx" ON "Staking"("userAddress")`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Staking_status_idx" ON "Staking"("status")`;
        console.log('[Unstake Complete] Staking table created, but no unstake request found');
        return NextResponse.json(
          { error: 'No active unstake request found' },
          { status: 400 }
        );
      } catch (createError: any) {
        console.error('[Unstake Complete] Failed to create Staking table:', createError);
        return NextResponse.json(
          { error: 'Database migration required. The Staking table may not exist yet.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to complete unstake' },
      { status: 500 }
    );
  }
}

