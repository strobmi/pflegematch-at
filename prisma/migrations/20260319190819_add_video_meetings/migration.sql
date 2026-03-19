-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "VideoMeeting" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "wherebyMeetingId" TEXT NOT NULL,
    "roomUrl" TEXT NOT NULL,
    "hostRoomUrl" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoMeeting_wherebyMeetingId_key" ON "VideoMeeting"("wherebyMeetingId");

-- CreateIndex
CREATE INDEX "VideoMeeting_tenantId_idx" ON "VideoMeeting"("tenantId");

-- CreateIndex
CREATE INDEX "VideoMeeting_matchId_idx" ON "VideoMeeting"("matchId");

-- CreateIndex
CREATE INDEX "VideoMeeting_scheduledAt_idx" ON "VideoMeeting"("scheduledAt");

-- AddForeignKey
ALTER TABLE "VideoMeeting" ADD CONSTRAINT "VideoMeeting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoMeeting" ADD CONSTRAINT "VideoMeeting_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
