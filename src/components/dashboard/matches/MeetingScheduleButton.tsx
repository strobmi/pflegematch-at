"use client";

import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import type { MatchStatus } from "@prisma/client";

interface MeetingScheduleButtonProps {
  matchId: string;
  matchStatus: MatchStatus;
}

const ALLOWED_STATUSES: MatchStatus[] = ["PENDING", "ACCEPTED", "ACTIVE"];

export default function MeetingScheduleButton({
  matchId,
  matchStatus,
}: MeetingScheduleButtonProps) {
  const router = useRouter();

  if (!ALLOWED_STATUSES.includes(matchStatus)) return null;

  return (
    <button
      onClick={() => router.push(`/vermittler/matches/${matchId}/video`)}
      title="Videotermin planen"
      className="p-1.5 text-[#2D2D2D]/40 hover:text-[#7B9E7B] hover:bg-[#F0F7F0] rounded-lg transition-colors"
    >
      <Video className="w-4 h-4" />
    </button>
  );
}
