"use client";

import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Video, Clock, CalendarOff } from "lucide-react";
import type { MeetingStatus } from "@prisma/client";

interface Meeting {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  status: MeetingStatus;
  notes: string | null;
}

interface UpcomingMeetingsListProps {
  meetings: Meeting[];
  role: "KUNDE" | "PFLEGER";
  locale?: string;
}

const STATUS_LABELS: Record<MeetingStatus, string> = {
  SCHEDULED: "Geplant",
  CANCELLED: "Abgesagt",
  COMPLETED: "Abgeschlossen",
};

const STATUS_COLORS: Record<MeetingStatus, string> = {
  SCHEDULED: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  COMPLETED: "bg-gray-50 text-gray-500 border-gray-200",
};

function isJoinable(scheduledAt: Date): boolean {
  const now = Date.now();
  const start = scheduledAt.getTime();
  const diff = start - now;
  // Joinable from 15 min before until 60 min after start
  return diff <= 15 * 60 * 1000 && now - start <= 60 * 60 * 1000;
}

export default function UpcomingMeetingsList({
  meetings,
  role,
  locale,
}: UpcomingMeetingsListProps) {
  const basePath = role === "KUNDE"
    ? "/kunde"
    : locale
      ? `/${locale}/dashboard/pfleger`
      : "/pfleger";

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center">
        <CalendarOff className="w-8 h-8 text-[#2D2D2D]/20 mx-auto mb-2" />
        <p className="text-sm text-[#2D2D2D]/50">
          Keine bevorstehenden Videotermine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((m) => (
        <div
          key={m.id}
          className="bg-white rounded-2xl border border-[#EAD9C8] p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-[#C06B4A] shrink-0" />
              <span className="font-semibold text-sm text-[#2D2D2D]">
                {format(m.scheduledAt, "EEEE, dd. MMMM yyyy · HH:mm", {
                  locale: de,
                })}{" "}
                Uhr
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-[#2D2D2D]/50">
                <Clock className="w-3 h-3" />
                {m.durationMin} min
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[m.status]}`}
              >
                {STATUS_LABELS[m.status]}
              </span>
            </div>
            {m.notes && (
              <p className="mt-2 text-xs text-[#2D2D2D]/60 truncate">
                {m.notes}
              </p>
            )}
          </div>

          {m.status === "SCHEDULED" && (
            <div className="flex gap-2 shrink-0">
              <Link
                href={`${basePath}/meetings/${m.id}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  isJoinable(m.scheduledAt)
                    ? "bg-[#C06B4A] text-white hover:bg-[#A05438]"
                    : "bg-[#EAD9C8] text-[#2D2D2D]/60 hover:bg-[#DCC9B0]"
                }`}
              >
                {isJoinable(m.scheduledAt) ? "Beitreten" : "Öffnen"}
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
