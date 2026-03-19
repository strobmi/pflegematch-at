/*
  Warnings:

  - Made the column `tenantId` on table `MatchRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MatchRequest" DROP CONSTRAINT "MatchRequest_tenantId_fkey";

-- AlterTable
ALTER TABLE "MatchRequest" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "isPlatform" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "MatchRequest" ADD CONSTRAINT "MatchRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
