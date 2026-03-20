-- AlterTable
ALTER TABLE "MatchRequest" ADD COLUMN     "targetCaregiverId" TEXT;

-- CreateIndex
CREATE INDEX "MatchRequest_targetCaregiverId_idx" ON "MatchRequest"("targetCaregiverId");

-- AddForeignKey
ALTER TABLE "MatchRequest" ADD CONSTRAINT "MatchRequest_targetCaregiverId_fkey" FOREIGN KEY ("targetCaregiverId") REFERENCES "CaregiverProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
