"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { User, CheckCircle, Calendar, Video, Clock, ThumbsUp } from "lucide-react";
import { acceptMatch } from "@/app/(dashboard)/kunde/matches/actions";

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
  const router = useRouter();

  const meeting = match.videoMeetings[0] ?? null;
  const caregiverName =
    match.caregiverProfile.user.name ?? match.caregiverProfile.user.email;

  function handleAccept() {
    startTransition(async () => {
      await acceptMatch(match.id);
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
            <a
              href={meeting.roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 underline"
            >
              Zum Videotermin beitreten →
            </a>
          </div>
        )}

        {/* Accept after call */}
        {match.status === "PENDING" && meeting && (
          <div className="pt-1">
            <p className="text-xs text-[#2D2D2D]/50 mb-2">
              Nach dem Kennenlerngespräch: Hat Ihnen die Pflegekraft gefallen?
            </p>
            <button
              onClick={handleAccept}
              disabled={isPending}
              className="flex items-center gap-2 bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? (
                <CheckCircle className="w-4 h-4 animate-pulse" />
              ) : (
                <ThumbsUp className="w-4 h-4" />
              )}
              {isPending ? "Wird gespeichert…" : "Pflegekraft akzeptieren"}
            </button>
          </div>
        )}

        {match.status === "ACCEPTED" && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4" />
            Pflegekraft akzeptiert – Ihr Vermittler bereitet den Vertrag vor.
          </div>
        )}
      </div>
    </div>
  );
}
