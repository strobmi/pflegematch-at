"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { User, MapPin, Star, Calendar, CheckCircle, Video } from "lucide-react";
import { scheduleMeetingFromSlot } from "@/app/(dashboard)/vermittler/matches/video-actions";

export interface Wunschtermin {
  dateTime: string;
  durationMin: 30 | 60;
}

interface VideoMeeting {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  roomUrl: string;
  status: string;
}

interface ClientProfile {
  id: string;
  pflegegeldStufe: string | null;
  locationCity: string | null;
  user: { name: string | null; email: string };
}

interface Match {
  id: string;
  status: string;
  score: number | null;
  videoMeetings: VideoMeeting[];
  clientProfile: ClientProfile;
}

const STATUS_LABELS: Record<string, string> = {
  PROPOSED:  "Vorgeschlagen",
  PENDING:   "Ausstehend",
  ACCEPTED:  "Akzeptiert",
  ACTIVE:    "Aktiv",
  COMPLETED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

const STATUS_COLORS: Record<string, string> = {
  PROPOSED:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  PENDING:   "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED:  "bg-green-50 text-green-700 border-green-200",
  ACTIVE:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-gray-50 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function PflegerMatchCard({
  match,
  wunschtermine,
}: {
  match: Match;
  wunschtermine: Wunschtermin[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ownDate, setOwnDate] = useState("");
  const [ownTime, setOwnTime] = useState("");
  const [ownDuration, setOwnDuration] = useState<30 | 60>(30);
  const router = useRouter();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const meeting = match.videoMeetings[0] ?? null;
  const clientName = match.clientProfile.user.name ?? match.clientProfile.user.email;

  function handleSchedule(slot: Wunschtermin) {
    setError(null);
    startTransition(async () => {
      const result = await scheduleMeetingFromSlot(match.id, slot.dateTime, slot.durationMin);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.refresh();
      }
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
              <p className="font-semibold text-[#2D2D2D]">{clientName}</p>
              <p className="text-xs text-[#2D2D2D]/50">{match.clientProfile.user.email}</p>
              <div className="flex items-center gap-3 mt-1">
                {match.clientProfile.locationCity && (
                  <span className="flex items-center gap-1 text-xs text-[#2D2D2D]/50">
                    <MapPin className="w-3 h-3" />
                    {match.clientProfile.locationCity}
                  </span>
                )}
                {match.clientProfile.pflegegeldStufe && (
                  <span className="text-xs text-[#2D2D2D]/50">
                    Stufe {match.clientProfile.pflegegeldStufe.replace("STUFE_", "")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {match.score != null && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#C06B4A] bg-[#C06B4A]/10 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3" />
                {match.score}
              </span>
            )}
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[match.status] ?? ""}`}
            >
              {STATUS_LABELS[match.status] ?? match.status}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        {/* Confirmed meeting */}
        {meeting && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-blue-700">
              <Video className="w-4 h-4" />
              <span className="text-sm font-semibold">Bestätigter Videotermin</span>
            </div>
            <p className="text-sm text-blue-600">
              {format(meeting.scheduledAt, "EEEE, dd. MMMM yyyy · HH:mm 'Uhr'", { locale: de })}{" "}
              ({meeting.durationMin} Min.)
            </p>
            <a
              href={meeting.roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-700 underline"
            >
              Beitreten →
            </a>
          </div>
        )}

        {/* Wunschtermine Kennenlernen — only show if no meeting yet */}
        {!meeting && wunschtermine.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#2D2D2D]/60">
              Wunschtermine Kennenlernen
            </p>
            {wunschtermine.map((slot, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 bg-[#FAF6F1] rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-[#2D2D2D]">
                  <Calendar className="w-4 h-4 text-[#C06B4A]" />
                  {format(new Date(slot.dateTime), "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })}
                  {" "}({slot.durationMin} Min.)
                </div>
                <button
                  onClick={() => handleSchedule(slot)}
                  disabled={isPending}
                  className="bg-[#C06B4A] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#A05438] disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  Termin vereinbaren
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No Kunde slots — Pfleger can propose own time */}
        {!meeting && wunschtermine.length === 0 && match.status === "PENDING" && (
          <div className="bg-[#FAF6F1] rounded-xl px-4 py-4 space-y-3">
            <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">
              Kennenlerngespräch vorschlagen
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-[#2D2D2D]/50">Datum</label>
                <input
                  type="date"
                  min={tomorrowStr}
                  value={ownDate}
                  onChange={(e) => setOwnDate(e.target.value)}
                  className="w-full text-sm border border-[#EAD9C8] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#2D2D2D]/50">Uhrzeit</label>
                <input
                  type="time"
                  value={ownTime}
                  onChange={(e) => setOwnTime(e.target.value)}
                  className="w-full text-sm border border-[#EAD9C8] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={ownDuration}
                onChange={(e) => setOwnDuration(Number(e.target.value) as 30 | 60)}
                className="text-sm border border-[#EAD9C8] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
              >
                <option value={30}>30 Min.</option>
                <option value={60}>60 Min.</option>
              </select>
              <button
                disabled={!ownDate || !ownTime || isPending}
                onClick={() => {
                  if (!ownDate || !ownTime) return;
                  handleSchedule({ dateTime: `${ownDate}T${ownTime}:00`, durationMin: ownDuration });
                }}
                className="flex-1 bg-[#C06B4A] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#A05438] disabled:opacity-40 transition-colors"
              >
                {isPending ? "Wird erstellt…" : "Termin erstellen"}
              </button>
            </div>
          </div>
        )}

        {match.status === "ACCEPTED" && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4" />
            Klient hat die Zusammenarbeit bestätigt.
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
