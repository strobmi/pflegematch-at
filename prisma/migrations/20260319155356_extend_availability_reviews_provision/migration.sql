-- CreateEnum
CREATE TYPE "CaregiverType" AS ENUM ('EMPLOYED', 'FREELANCE');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'ON_ASSIGNMENT', 'VACATION', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ProvisionStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID');

-- CreateEnum
CREATE TYPE "ReviewTarget" AS ENUM ('CAREGIVER', 'VERMITTLER');

-- AlterTable
ALTER TABLE "CaregiverProfile" ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "isPlatformVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "CaregiverType" NOT NULL DEFAULT 'EMPLOYED';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "provisionAmount" DECIMAL(8,2),
ADD COLUMN     "provisionStatus" "ProvisionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "MatchRequest" ADD COLUMN     "assignedToUserId" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "provisionPercent" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastAssignedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CaregiverAvailability" (
    "id" TEXT NOT NULL,
    "caregiverProfileId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "AvailabilityStatus" NOT NULL,
    "matchId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaregiverAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetType" "ReviewTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaregiverAvailability_caregiverProfileId_idx" ON "CaregiverAvailability"("caregiverProfileId");

-- CreateIndex
CREATE INDEX "CaregiverAvailability_tenantId_idx" ON "CaregiverAvailability"("tenantId");

-- CreateIndex
CREATE INDEX "CaregiverAvailability_startDate_endDate_idx" ON "CaregiverAvailability"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Review_matchId_idx" ON "Review"("matchId");

-- CreateIndex
CREATE INDEX "Review_targetId_idx" ON "Review"("targetId");

-- CreateIndex
CREATE INDEX "MatchRequest_assignedToUserId_idx" ON "MatchRequest"("assignedToUserId");

-- AddForeignKey
ALTER TABLE "MatchRequest" ADD CONSTRAINT "MatchRequest_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverAvailability" ADD CONSTRAINT "CaregiverAvailability_caregiverProfileId_fkey" FOREIGN KEY ("caregiverProfileId") REFERENCES "CaregiverProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverAvailability" ADD CONSTRAINT "CaregiverAvailability_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverAvailability" ADD CONSTRAINT "CaregiverAvailability_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
