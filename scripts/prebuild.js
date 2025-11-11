#!/usr/bin/env node
/**
 * Pre-build script to ensure Prisma Client types are generated
 * This script verifies that Prisma Client includes the Staking model
 * before allowing the build to proceed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Prisma Client generation...');

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Verify the generated client includes Staking model
  const clientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client', 'index.js');
  if (!fs.existsSync(clientPath)) {
    throw new Error('Prisma Client not generated');
  }
  
  // Check if Staking model exists in runtime client
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  if (!('staking' in prisma)) {
    throw new Error('Staking model not found in Prisma Client');
  }
  
  // Verify TypeScript types file exists and contains Staking
  const typesPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client', 'index.d.ts');
  if (fs.existsSync(typesPath)) {
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    // Check for Staking in the types (might be lowercase 'staking' in types)
    if (!typesContent.includes('staking') && !typesContent.includes('Staking')) {
      console.warn('⚠️  Warning: Staking types not found in TypeScript definitions');
      console.warn('   This might cause TypeScript errors, but runtime will work');
    }
  }
  
  console.log('✅ Prisma Client generated successfully with Staking model');
  console.log('✅ Ready to build');
  
} catch (error) {
  console.error('❌ Prisma Client verification failed:', error.message);
  process.exit(1);
}

