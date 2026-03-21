"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { User, CheckCircle, Calendar, Video, Clock, Plus, ThumbsUp } from "lucide-react";
import { selectProposal, proposeAlternatives, acceptMatch } from "@/app/(dashboard)/kunde/matches/actions";

interface Proposal {
  id: string;
  proposedAt: Date;
  durationMin: number;
  status: string;
  proposedBy: string;
}

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
  meetingProposals: Proposal[];
  videoMeetings: VideoMeeting[];
  caregiverProfile: CaregiverProfile;
}

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
  PROPOSED: "Vorgeschlagen",
  PENDING: "Ausstehend",
  ACCEPTED: "Akzeptiert",
};

export default function KundeMatchCard({ match }: { match: Match }) {
  const [isPending, startTransition] = useTransition();
  const [showAltForm, setShowAltForm] = useState(false);
  const [altSlots, setAltSlots] = useState<{ proposedAt: string; durationMin: 30 | 60 }[]>([
    { proposedAt: "", durationMin: 30 },
    { proposedAt: "", durationMin: 30 },
    { proposedAt: "", durationMin: 30 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const openProposals = match.meetingProposals.filter(
    (p) => p.status === "OPEN" && (p.proposedBy === "PFLEGER" || p.proposedBy === "VERMITTLER")
  );
  const kundeProposals = match.meetingProposals.filter(
    (p) => p.status === "OPEN" && p.proposedBy === "KUNDE"
  );
  const hasConfirmedMeeting = match.videoMeetings.length > 0;

  const caregiverName =
    match.caregiverProfile.user.name ?? match.caregiverProfile.user.email;

  function handleSelect(proposalId: string) {
    setError(null);
    startTransition(async () => {
      const result = await selectProposal(proposalId);
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  }

  function handleProposeAlternatives() {
    const validSlots = altSlots.filter((s) => s.proposedAt);
    if (validSlots.length === 0) {
      setError("Bitte mindestens einen Alternativtermin eingeben.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await proposeAlternatives({
        matchId: match.id,
        slots: validSlots,
      });
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        setSuccess("Ihre Alternativtermine wurden übermittelt.");
        setShowAltForm(false);
        router.refresh();
      }
    });
  }

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptMatch(match.id);
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      {/* Header: Pflegekraft-Info */}
      <div className="p-5 border-b border-[#EAD9C8]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C06B4A]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#C06B4A]" />
            </div>
            <div>
              <p className="font-semibold text-[#2D2D2D]">{caregiverName}</p>
              {match.caregiverProfile.locationCity && (
                <p className="text-xs text-[#2D2D2D]/50">{match.caregiverProfile.locationCity}</p>
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

      {/* Confirmed Meeting */}
      {hasConfirmedMeeting && (
        <div className="px-5 py-4 bg-blue-50 border-b border-blue-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <Video className="w-4 h-4" />
            <span className="text-sm font-semibold">Ihr Videotermin</span>
          </div>
          {match.videoMeetings.map((vm) => (
            <div key={vm.id} className="text-sm text-blue-600">
              {format(vm.scheduledAt, "EEEE, dd. MMMM yyyy · HH:mm 'Uhr'", { locale: de })} ({vm.durationMin} Min.)
              <br />
              <a
                href={vm.roomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium mt-1 inline-block"
              >
                Zum Videotermin beitreten →
              </a>
            </div>
          ))}

          {/* Accept button after meeting */}
          {match.status === "PENDING" && (
            <div className="pt-2">
              <p className="text-xs text-blue-600/70 mb-2">
                Nach dem Kennenlerngespräch: Hat Ihnen die Pflegekraft gefallen?
              </p>
              <button
                onClick={handleAccept}
                disabled={isPending}
                className="flex items-center gap-2 bg-green-600 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                {isPending ? "Wird gespeichert..." : "Pflegekraft akzeptieren"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Proposals */}
      <div className="p-5 space-y-3">
        {/* Success message */}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Waiting for proposals */}
        {match.status === "PROPOSED" && openProposals.length === 0 && kundeProposals.length === 0 && !hasConfirmedMeeting && (
          <div className="flex items-center gap-2 text-sm text-[#2D2D2D]/50 bg-[#FAF6F1] rounded-xl px-4 py-3">
            <Clock className="w-4 h-4" />
            Ihr Vermittler bereitet Terminvorschläge vor.
          </div>
        )}

        {/* Kunde's counter-proposals sent */}
        {kundeProposals.length > 0 && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-green-700">
              Ihre Alternativtermine wurden übermittelt
            </p>
            {kundeProposals.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-green-600">
                <Calendar className="w-4 h-4" />
                {format(p.proposedAt, "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })} ({p.durationMin} Min.)
              </div>
            ))}
            <p className="text-xs text-green-600/70">
              Ihr Vermittler wählt einen Ihrer Termine und bestätigt ihn.
            </p>
          </div>
        )}

        {/* Open proposals to choose from */}
        {openProposals.length > 0 && !hasConfirmedMeeting && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#2D2D2D]">
              Bitte wählen Sie einen Termin für das Kennenlerngespräch:
            </p>
            {openProposals.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 bg-[#FAF6F1] rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-[#2D2D2D]">
                  <Calendar className="w-4 h-4 text-[#C06B4A]" />
                  {format(p.proposedAt, "EEEE, dd. MMMM yyyy · HH:mm 'Uhr'", { locale: de })} ({p.durationMin} Min.)
                </div>
                <button
                  onClick={() => handleSelect(p.id)}
                  disabled={isPending}
                  className="bg-[#C06B4A] text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#A05438] disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  Wählen
                </button>
              </div>
            ))}

            {/* Propose alternatives */}
            {!showAltForm && (
              <button
                onClick={() => setShowAltForm(true)}
                className="flex items-center gap-2 text-sm text-[#2D2D2D]/55 hover:text-[#2D2D2D] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Keiner passt – Alternativtermine vorschlagen
              </button>
            )}

            {showAltForm && (
              <div className="border border-[#EAD9C8] rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-[#2D2D2D]">
                  Bis zu 3 Alternativtermine:
                </p>
                {altSlots.map((slot, i) => (
                  <div key={i} className="grid sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-[#2D2D2D]/50 mb-1">
                        Termin {i + 1}
                      </label>
                      <input
                        type="datetime-local"
                        value={slot.proposedAt}
                        onChange={(e) => {
                          const updated = [...altSlots];
                          updated[i] = { ...updated[i], proposedAt: e.target.value ?? "" };
                          setAltSlots(updated);
                        }}
                        min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                        className="w-full rounded-lg border border-[#EAD9C8] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#2D2D2D]/50 mb-1">Dauer</label>
                      <select
                        value={slot.durationMin}
                        onChange={(e) => {
                          const updated = [...altSlots];
                          updated[i] = { ...updated[i], durationMin: Number(e.target.value) as 30 | 60 };
                          setAltSlots(updated);
                        }}
                        className="w-full rounded-lg border border-[#EAD9C8] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
                      >
                        <option value={30}>30 Minuten</option>
                        <option value={60}>60 Minuten</option>
                      </select>
                    </div>
                  </div>
                ))}
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleProposeAlternatives}
                    disabled={isPending}
                    className="flex-1 bg-[#C06B4A] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#A05438] disabled:opacity-50 transition-colors"
                  >
                    {isPending ? "Wird übermittelt..." : "Alternativtermine senden"}
                  </button>
                  <button
                    onClick={() => setShowAltForm(false)}
                    className="px-4 py-2 text-sm text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && !showAltForm && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
