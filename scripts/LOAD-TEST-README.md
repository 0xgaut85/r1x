# Load Testing Script Setup

## Overview

The load testing script sends parallel requests from 50 wallets to the r1x Agent chat endpoint every 15 seconds to boost transaction count.

## Quick Start

### Option 1: Generate Keys Automatically (Recommended)

```bash
# Generate 50 private keys automatically
npm run generate-load-test-keys

# This will:
# - Generate 50 secure private keys
# - Create .env.loadtest file automatically
# - Display wallet addresses for funding
# - Create .env.loadtest.addresses.txt for easy copying
```

Then fund each wallet with Base ETH and USDC, and run:
```bash
npm run load-test
```

### Option 2: Manual Setup

#### 1. Create `.env.loadtest` file

Create a file named `.env.loadtest` in the project root with your 50 private keys:

```env
PRIVATE_KEY_1=0x...
PRIVATE_KEY_2=0x...
PRIVATE_KEY_3=0x...
# ... continue up to PRIVATE_KEY_50
```

**Important**: 
- `.env.loadtest` is gitignored and will NOT be committed
- Never commit private keys to the repository
- Each wallet needs Base ETH (min 0.001 ETH) and USDC (min 0.5 USDC)

### 2. Optional Configuration

You can customize the script behavior by adding these variables to `.env.loadtest`:

```env
# Endpoint URL (default: https://www.r1xlabs.com/api/r1x-agent/chat)
LOAD_TEST_ENDPOINT=https://www.r1xlabs.com/api/r1x-agent/chat

# Message to send (default: Hello)
LOAD_TEST_MESSAGE=Hello

# Interval between rounds in milliseconds (default: 15000 = 15 seconds)
LOAD_TEST_INTERVAL_MS=15000

# Maximum payment amount in USDC (default: 0.25)
LOAD_TEST_MAX_PAYMENT_USDC=0.25

# Minimum Base ETH balance required (default: 0.001)
LOAD_TEST_MIN_BASE_BALANCE_ETH=0.001

# Minimum USDC balance required (default: 0.5)
LOAD_TEST_MIN_USDC_BALANCE=0.5

# Base RPC URL (default: https://mainnet.base.org)
BASE_RPC_URL=https://mainnet.base.org
```

### 3. Run the Load Test

```bash
npm run load-test
```

## How It Works

1. **Loads 50 private keys** from `.env.loadtest`
2. **Creates wallet clients** using viem for Base network
3. **Checks balances** - verifies each wallet has sufficient Base ETH and USDC
4. **Sends parallel requests** - all 50 wallets send requests simultaneously every 15 seconds
5. **Uses x402-fetch** - automatically handles payment flow (402 → payment → retry)
6. **Logs results** - saves results to CSV file in `scripts/load-test-results/`

## Results

Results are saved to CSV files in `scripts/load-test-results/` with the format:
- `load-test-{timestamp}.csv`

CSV columns:
- `timestamp` - Request timestamp
- `wallet_address` - Wallet address that made the request
- `status_code` - HTTP status code
- `success` - Whether request succeeded
- `error_message` - Error message if failed
- `response_time_ms` - Response time in milliseconds
- `transaction_hash` - On-chain transaction hash (if available)

## Safety Features

- Private keys are never committed (gitignored)
- Results directory is gitignored
- Balance checks before starting
- Graceful error handling per wallet
- Configurable payment limits
- Graceful shutdown (Ctrl+C)

## Stopping the Script

Press `Ctrl+C` to stop the script gracefully. It will print summary statistics before exiting.

