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
      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-[#5A7A5A]/10 text-[#5A7A5A] hover:bg-[#5A7A5A]/20 transition-colors whitespace-nowrap cursor-pointer"
    >
      <Video className="w-3 h-3" />
      Kennenlernen
    </button>
  );
}
