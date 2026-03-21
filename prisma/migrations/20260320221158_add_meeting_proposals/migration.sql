-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('OPEN', 'SELECTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ProposedByRole" AS ENUM ('PFLEGER', 'VERMITTLER', 'KUNDE');

-- CreateTable
CREATE TABLE "MeetingProposal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "proposedAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "status" "ProposalStatus" NOT NULL DEFAULT 'OPEN',
    "proposedBy" "ProposedByRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingProposal_matchId_idx" ON "MeetingProposal"("matchId");

-- CreateIndex
CREATE INDEX "MeetingProposal_tenantId_idx" ON "MeetingProposal"("tenantId");

-- AddForeignKey
ALTER TABLE "MeetingProposal" ADD CONSTRAINT "MeetingProposal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingProposal" ADD CONSTRAINT "MeetingProposal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
