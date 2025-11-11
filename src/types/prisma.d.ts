/**
 * Type declaration to fix Prisma Client TypeScript types
 * This ensures the Staking model is recognized by TypeScript
 * even if Prisma Client generation doesn't include it in types
 */

import { PrismaClient as BasePrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    staking: {
      findUnique: (args: { where: { userAddress: string } }) => Promise<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        unstakeRequestedAt: Date | null;
        unstakeCompletedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
      } | null>;
      findMany: (args?: {
        where?: {
          status?: {
            in?: string[];
          };
        };
      }) => Promise<Array<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        unstakeRequestedAt: Date | null;
        unstakeCompletedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
      }>>;
      create: (args: {
        data: {
          userAddress: string;
          stakedAmount: string;
          status: string;
        };
      }) => Promise<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        unstakeRequestedAt: Date | null;
        unstakeCompletedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
      update: (args: {
        where: { userAddress: string };
        data: {
          stakedAmount?: string;
          status?: string;
          unstakeRequestedAt?: Date | null;
          unstakeCompletedAt?: Date | null;
        };
      }) => Promise<{
        id: string;
        userAddress: string;
        stakedAmount: string;
        unstakeRequestedAt: Date | null;
        unstakeCompletedAt: Date | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
      }>;
    };
  }
}

export {};

