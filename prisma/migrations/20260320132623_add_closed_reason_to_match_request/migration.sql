-- CreateEnum
CREATE TYPE "ClosedReason" AS ENUM ('KEIN_INTERESSE', 'ANDERWEITIG_VERSORGT', 'KEIN_PFLEGER', 'NICHT_ERREICHBAR', 'SONSTIGES');

-- AlterTable
ALTER TABLE "MatchRequest" ADD COLUMN     "closedNote" TEXT,
ADD COLUMN     "closedReason" "ClosedReason";
