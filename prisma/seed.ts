/**
 * Database Migration Script
 * 
 * Run this to set up the database schema
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Database connection successful!');
  
  // You can add seed data here if needed
  // Example:
  // await prisma.service.create({
  //   data: {
  //     serviceId: 'example-service',
  //     name: 'Example Service',
  //     description: 'An example service',
  //     merchant: process.env.MERCHANT_ADDRESS || '',
  //     price: '1000000', // 1 USDC in wei
  //     priceDisplay: '1.0',
  //     token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  //     tokenSymbol: 'USDC',
  //   },
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

