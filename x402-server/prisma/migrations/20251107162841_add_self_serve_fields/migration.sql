-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "merchant" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'base',
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "token" TEXT NOT NULL,
    "tokenSymbol" TEXT,
    "price" TEXT NOT NULL,
    "priceDisplay" TEXT NOT NULL,
    "endpoint" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "type" TEXT,
    "method" TEXT,
    "inputSchema" JSONB,
    "outputSchema" JSONB,
    "source" TEXT,
    "isExternal" BOOLEAN,
    "ownerAddress" TEXT,
    "approvalStatus" TEXT,
    "verified" BOOLEAN,
    "x402Ready" BOOLEAN,
    "lastPreflightAt" TIMESTAMP(3),
    "lastPreflightStatus" TEXT,
    "facilitatorUrl" TEXT,
    "tokenAddress" TEXT,
    "payTo" TEXT,
    "websiteUrl" TEXT,
    "screenshotUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" INTEGER,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "quoteNonce" TEXT,
    "quoteDeadline" INTEGER,
    "feeAmount" TEXT NOT NULL,
    "merchantAmount" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verificationStatus" TEXT,
    "settlementHash" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fee" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "feeAmount" TEXT NOT NULL,
    "feeRecipient" TEXT NOT NULL,
    "transferHash" TEXT,
    "transferred" BOOLEAN NOT NULL DEFAULT false,
    "transferredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_serviceId_key" ON "Service"("serviceId");

-- CreateIndex
CREATE INDEX "Service_merchant_idx" ON "Service"("merchant");

-- CreateIndex
CREATE INDEX "Service_network_chainId_idx" ON "Service"("network", "chainId");

-- CreateIndex
CREATE INDEX "Service_category_idx" ON "Service"("category");

-- CreateIndex
CREATE INDEX "Service_available_idx" ON "Service"("available");

-- CreateIndex
CREATE INDEX "Service_ownerAddress_idx" ON "Service"("ownerAddress");

-- CreateIndex
CREATE INDEX "Service_approvalStatus_idx" ON "Service"("approvalStatus");

-- CreateIndex
CREATE INDEX "Service_x402Ready_idx" ON "Service"("x402Ready");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionHash_key" ON "Transaction"("transactionHash");

-- CreateIndex
CREATE INDEX "Transaction_transactionHash_idx" ON "Transaction"("transactionHash");

-- CreateIndex
CREATE INDEX "Transaction_from_idx" ON "Transaction"("from");

-- CreateIndex
CREATE INDEX "Transaction_to_idx" ON "Transaction"("to");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_serviceId_idx" ON "Transaction"("serviceId");

-- CreateIndex
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp");

-- CreateIndex
CREATE INDEX "Fee_transactionId_idx" ON "Fee"("transactionId");

-- CreateIndex
CREATE INDEX "Fee_feeRecipient_idx" ON "Fee"("feeRecipient");

-- CreateIndex
CREATE INDEX "Fee_transferred_idx" ON "Fee"("transferred");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

