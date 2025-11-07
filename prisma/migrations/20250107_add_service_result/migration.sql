-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."ServiceResult" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT,
    "transactionHash" TEXT,
    "serviceId" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "resultText" TEXT,
    "resultJson" JSONB,
    "filename" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceResult_transactionHash_key" ON "public"."ServiceResult"("transactionHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceResult_payer_idx" ON "public"."ServiceResult"("payer");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceResult_serviceId_idx" ON "public"."ServiceResult"("serviceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceResult_createdAt_idx" ON "public"."ServiceResult"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."ServiceResult" ADD CONSTRAINT "ServiceResult_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceResult" ADD CONSTRAINT "ServiceResult_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

