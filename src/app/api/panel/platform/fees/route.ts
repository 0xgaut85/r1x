/**
 * Platform Panel - Fees API
 * 
 * GET /api/panel/platform/fees
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';
import { getExplorerUrl } from '@/lib/explorer-url';

const USDC_DECIMALS = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const feeRecipient = searchParams.get('recipient'); // Filter by fee recipient

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const where: any = {
      createdAt: { gte: startDate },
    };

    if (feeRecipient) {
      where.feeRecipient = feeRecipient.toLowerCase();
    }

    const fees = await prisma.fee.findMany({
      where,
      include: {
        transaction: {
          include: {
            service: {
              select: {
                serviceId: true,
                name: true,
                category: true,
                network: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalFees = fees.reduce((sum, fee) => sum + BigInt(fee.feeAmount), BigInt(0));
    const transferredFees = fees
      .filter(fee => fee.transferred)
      .reduce((sum, fee) => sum + BigInt(fee.feeAmount), BigInt(0));
    const pendingFees = fees
      .filter(fee => !fee.transferred)
      .reduce((sum, fee) => sum + BigInt(fee.feeAmount), BigInt(0));

    // Daily fee collection
    const dailyFees = fees.reduce((acc, fee) => {
      const date = fee.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          total: BigInt(0),
          transferred: BigInt(0),
          pending: BigInt(0),
          count: 0,
        };
      }
      acc[date].total += BigInt(fee.feeAmount);
      acc[date].count++;
      if (fee.transferred) {
        acc[date].transferred += BigInt(fee.feeAmount);
      } else {
        acc[date].pending += BigInt(fee.feeAmount);
      }
      return acc;
    }, {} as Record<string, { date: string; total: bigint; transferred: bigint; pending: bigint; count: number }>);

    const dailyData = Object.values(dailyFees).map(day => ({
      date: day.date,
      total: formatUnits(day.total, USDC_DECIMALS),
      transferred: formatUnits(day.transferred, USDC_DECIMALS),
      pending: formatUnits(day.pending, USDC_DECIMALS),
      count: day.count,
    }));

    // Fees by recipient
    const feesByRecipient = fees.reduce((acc, fee) => {
      const recipient = fee.feeRecipient;
      if (!acc[recipient]) {
        acc[recipient] = {
          recipient,
          total: BigInt(0),
          transferred: BigInt(0),
          pending: BigInt(0),
          count: 0,
        };
      }
      acc[recipient].total += BigInt(fee.feeAmount);
      acc[recipient].count++;
      if (fee.transferred) {
        acc[recipient].transferred += BigInt(fee.feeAmount);
      } else {
        acc[recipient].pending += BigInt(fee.feeAmount);
      }
      return acc;
    }, {} as Record<string, { recipient: string; total: bigint; transferred: bigint; pending: bigint; count: number }>);

    const recipientData = Object.values(feesByRecipient).map(rec => ({
      ...rec,
      total: formatUnits(rec.total, USDC_DECIMALS),
      transferred: formatUnits(rec.transferred, USDC_DECIMALS),
      pending: formatUnits(rec.pending, USDC_DECIMALS),
    }));

    // Recent fees
    const recentFees = fees.slice(0, 20).map(fee => ({
      id: fee.id,
      transactionHash: fee.transaction.transactionHash,
      serviceName: fee.transaction.service.name,
      serviceId: fee.transaction.service.serviceId,
      feeAmount: formatUnits(BigInt(fee.feeAmount), USDC_DECIMALS),
      feeRecipient: fee.feeRecipient,
      transferred: fee.transferred,
      transferHash: fee.transferHash,
      createdAt: fee.createdAt,
      transferredAt: fee.transferredAt,
      blockExplorerUrl: fee.transferHash 
        ? getExplorerUrl(
            fee.transferHash,
            fee.transaction.service.network || null,
            fee.transaction.chainId
          )
        : null,
    }));

    return NextResponse.json({
      period,
      summary: {
        totalFees: formatUnits(totalFees, USDC_DECIMALS),
        transferredFees: formatUnits(transferredFees, USDC_DECIMALS),
        pendingFees: formatUnits(pendingFees, USDC_DECIMALS),
        totalRecords: fees.length,
        transferredCount: fees.filter(f => f.transferred).length,
        pendingCount: fees.filter(f => !f.transferred).length,
      },
      dailyFees: dailyData,
      feesByRecipient: recipientData,
      recentFees,
    });
  } catch (error: any) {
    console.error('Platform fees API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

