/**
 * Platform Panel - Services API
 * 
 * GET /api/panel/platform/services
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatUnits } from 'viem';

const USDC_DECIMALS = 6;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

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

    // Get all services
    const services = await prisma.service.findMany({
      include: {
        transactions: {
          where: {
            timestamp: { gte: startDate },
            status: { in: ['verified', 'settled'] },
          },
        },
        _count: {
          select: {
            transactions: {
              where: {
                timestamp: { gte: startDate },
                status: { in: ['verified', 'settled'] },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats for each service
    const serviceStats = services.map(service => {
      const transactions = service.transactions;
      const totalVolume = transactions.reduce((sum, tx) => sum + BigInt(tx.amount), BigInt(0));
      const totalFees = transactions.reduce((sum, tx) => sum + BigInt(tx.feeAmount), BigInt(0));
      const uniqueUsers = new Set(
        transactions
          .filter(tx => tx.from && tx.from !== '')
          .map(tx => tx.from.toLowerCase())
      );

      return {
        serviceId: service.serviceId,
        name: service.name,
        description: service.description,
        category: service.category || 'Other',
        merchant: service.merchant,
        price: service.priceDisplay,
        available: service.available,
        totalTransactions: transactions.length,
        totalVolume: formatUnits(totalVolume, USDC_DECIMALS),
        totalFees: formatUnits(totalFees, USDC_DECIMALS),
        uniqueUsers: uniqueUsers.size,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      };
    });

    // Sort by transaction count
    serviceStats.sort((a, b) => b.totalTransactions - a.totalTransactions);

    // Calculate totals
    const totalVolume = serviceStats.reduce((sum, s) => sum + parseFloat(s.totalVolume), 0);
    const totalFees = serviceStats.reduce((sum, s) => sum + parseFloat(s.totalFees), 0);
    const totalTransactions = serviceStats.reduce((sum, s) => sum + s.totalTransactions, 0);

    return NextResponse.json({
      period,
      summary: {
        totalServices: serviceStats.length,
        activeServices: serviceStats.filter(s => s.available).length,
        totalTransactions,
        totalVolume: totalVolume.toFixed(6),
        totalFees: totalFees.toFixed(6),
      },
      services: serviceStats,
    });
  } catch (error: any) {
    console.error('Platform services API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

