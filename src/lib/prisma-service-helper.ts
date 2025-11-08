/**
 * Prisma Service Query Helper
 * 
 * Handles Service queries gracefully when migration hasn't been applied yet.
 * Wraps queries to catch P2022 errors (column doesn't exist) and retry with safe select.
 */

import { Prisma } from '@prisma/client';

const SAFE_SERVICE_SELECT = {
  id: true,
  serviceId: true,
  name: true,
  description: true,
  category: true,
  merchant: true,
  network: true,
  chainId: true,
  token: true,
  tokenSymbol: true,
  price: true,
  priceDisplay: true,
  endpoint: true,
  available: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Check if error is due to missing migration columns
 */
function isMigrationError(error: any): boolean {
  return error?.code === 'P2022' || 
         error?.message?.includes('does not exist') ||
         error?.message?.includes('column') && error?.message?.includes('does not exist');
}

/**
 * Execute a Service query with fallback for missing columns
 */
export async function safeServiceQuery<T>(
  queryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>
): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    if (isMigrationError(error)) {
      console.warn('[Prisma Service Helper] Migration not applied, using fallback query');
      if (fallbackFn) {
        return await fallbackFn();
      }
      throw new Error('Migration not applied and no fallback provided');
    }
    throw error;
  }
}

/**
 * Get safe select fields for Service (excludes new migration fields)
 */
export function getSafeServiceSelect() {
  return SAFE_SERVICE_SELECT;
}

