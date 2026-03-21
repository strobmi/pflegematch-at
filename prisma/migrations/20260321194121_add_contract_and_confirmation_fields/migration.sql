-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'TERMINATED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "caregiverConfirmed" BOOLEAN,
ADD COLUMN     "caregiverConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "clientConfirmed" BOOLEAN,
ADD COLUMN     "clientConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "matchFeeAmount" DECIMAL(8,2);

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "defaultMatchFee" DECIMAL(8,2),
ADD COLUMN     "defaultMonthlyFee" DECIMAL(8,2);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "caregiverProfileId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "noticePeriodDays" INTEGER NOT NULL DEFAULT 14,
    "notes" TEXT,
    "matchFeeAmount" DECIMAL(8,2),
    "monthlyFeeAmount" DECIMAL(8,2),
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_matchId_key" ON "Contract"("matchId");

-- CreateIndex
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");

-- CreateIndex
CREATE INDEX "Contract_caregiverProfileId_idx" ON "Contract"("caregiverProfileId");

-- CreateIndex
CREATE INDEX "Contract_clientProfileId_idx" ON "Contract"("clientProfileId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_caregiverProfileId_fkey" FOREIGN KEY ("caregiverProfileId") REFERENCES "CaregiverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
