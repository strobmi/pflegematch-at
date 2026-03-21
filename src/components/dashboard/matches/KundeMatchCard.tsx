"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { User, CheckCircle, Calendar, Video, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { confirmKennenlernen } from "@/app/(dashboard)/kunde/matches/actions";

interface VideoMeeting {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  roomUrl: string;
  status: string;
}

interface CaregiverProfile {
  id: string;
  locationCity: string | null;
  user: { name: string | null; email: string };
}

interface Match {
  id: string;
  status: string;
  score: number | null;
  videoMeetings: VideoMeeting[];
  caregiverProfile: CaregiverProfile;
  clientConfirmed: boolean | null;
  clientConfirmedAt: Date | null;
}

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PENDING:  "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
  PROPOSED: "Vorgeschlagen",
  PENDING:  "Ausstehend",
  ACCEPTED: "Akzeptiert",
};

export default function KundeMatchCard({ match }: { match: Match }) {
  const [isPending, startTransition] = useTransition();
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const router = useRouter();

  const now = new Date();
  const pastMeeting = match.videoMeetings.find(
    (m) => m.status !== "CANCELLED" && new Date(m.scheduledAt) < now
  ) ?? null;
  const upcomingMeeting = match.videoMeetings[0] ?? null;
  const meeting = upcomingMeeting;
  const caregiverName =
    match.caregiverProfile.user.name ?? match.caregiverProfile.user.email;

  function handleConfirm(confirmed: boolean) {
    setConfirmError(null);
    startTransition(async () => {
      const result = await confirmKennenlernen(match.id, confirmed);
      if (result.error) { setConfirmError(result.error); return; }
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#EAD9C8]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C06B4A]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#C06B4A]" />
            </div>
            <div>
              <p className="font-semibold text-[#2D2D2D]">{caregiverName}</p>
              {match.caregiverProfile.locationCity && (
                <p className="text-xs text-[#2D2D2D]/50">
                  {match.caregiverProfile.locationCity}
                </p>
              )}
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[match.status] ?? ""}`}
          >
            {STATUS_LABELS[match.status] ?? match.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        {/* No meeting yet */}
        {!meeting && (
          <div className="flex items-center gap-2 text-sm text-[#2D2D2D]/50 bg-[#FAF6F1] rounded-xl px-4 py-3">
            <Clock className="w-4 h-4" />
            Ihr Vermittler vereinbart demnächst einen Videotermin für Sie.
          </div>
        )}

        {/* Confirmed meeting */}
        {meeting && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-blue-700">
              <Video className="w-4 h-4" />
              <span className="text-sm font-semibold">Ihr Videotermin</span>
            </div>
            <p className="text-sm text-blue-600">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              {format(meeting.scheduledAt, "EEEE, dd. MMMM yyyy · HH:mm 'Uhr'", { locale: de })}
              {" "}({meeting.durationMin} Min.)
            </p>
            <Link
              href={`/kunde/meetings/${meeting.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 underline"
            >
              Zum Videotermin beitreten →
            </Link>
          </div>
        )}

        {/* Kennenlernen-Bestätigung */}
        {pastMeeting && match.clientConfirmed === null && match.status !== "ACTIVE" && match.status !== "COMPLETED" && (
          <div className="bg-[#FAF6F1] rounded-xl px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-[#2D2D2D]/60">Wie war das Kennenlerngespräch?</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm(true)}
                disabled={isPending}
                className="flex items-center gap-2 bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                Gespräch war erfolgreich
              </button>
              <button
                onClick={() => handleConfirm(false)}
                disabled={isPending}
                className="flex items-center gap-2 bg-white text-[#2D2D2D]/60 border border-[#EAD9C8] text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#F5EDE3] disabled:opacity-50 transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
                Passt leider nicht
              </button>
            </div>
            {confirmError && <p className="text-xs text-red-500">{confirmError}</p>}
          </div>
        )}

        {match.clientConfirmed === true && match.status !== "ACTIVE" && match.status !== "COMPLETED" && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4" />
            Bestätigt{match.clientConfirmedAt ? ` am ${format(new Date(match.clientConfirmedAt), "dd.MM.yyyy", { locale: de })}` : ""} – Ihr Vermittler bereitet den Vertrag vor.
          </div>
        )}

        {match.clientConfirmed === false && match.status !== "ACTIVE" && match.status !== "COMPLETED" && (
          <div className="flex items-center gap-2 text-sm text-[#2D2D2D]/60 bg-[#FAF6F1] rounded-xl px-4 py-3">
            Rückmeldung erhalten – Ihr Vermittler wird sich melden.
          </div>
        )}

        {match.status === "ACTIVE" && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4" />
            Vertrag aktiv – Ihr Vermittler hat den Vertrag aufgesetzt.
          </div>
        )}
      </div>
    </div>
  );
}
