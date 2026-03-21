"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { User, MapPin, Star, Calendar, CheckCircle, Clock, Plus, Trash2, Video } from "lucide-react";
import { addPflegerProposal, removeProposal } from "@/app/(dashboard)/vermittler/matches/proposal-actions";

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
  meetingProposals: Proposal[];
  videoMeetings: VideoMeeting[];
  clientProfile: ClientProfile;
}

const STATUS_LABELS: Record<string, string> = {
  PROPOSED: "Vorgeschlagen",
  PENDING: "Ausstehend",
  ACCEPTED: "Akzeptiert",
  ACTIVE: "Aktiv",
  COMPLETED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-gray-50 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function PflegerMatchCard({
  match,
  locale,
}: {
  match: Match;
  locale: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [proposedAt, setProposedAt] = useState("");
  const [durationMin, setDurationMin] = useState<30 | 60>(30);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const openProposals = match.meetingProposals.filter(
    (p) => p.status === "OPEN" && (p.proposedBy === "PFLEGER" || p.proposedBy === "VERMITTLER")
  );
  const kundeProposals = match.meetingProposals.filter(
    (p) => p.status === "OPEN" && p.proposedBy === "KUNDE"
  );
  const emailSent = openProposals.length >= 3;
  const canAddProposal =
    match.status === "PROPOSED" && !emailSent && openProposals.length < 3 && kundeProposals.length === 0;

  const clientName = match.clientProfile.user.name ?? match.clientProfile.user.email;

  function handleAddProposal() {
    if (!proposedAt) return;
    setError(null);
    startTransition(async () => {
      const result = await addPflegerProposal({
        matchId: match.id,
        proposedAt,
        durationMin,
      });
      if ("error" in result) {
        setError(result.error ?? null);
      } else {
        setProposedAt("");
        setDurationMin(30);
        setShowForm(false);
        router.refresh();
      }
    });
  }

  function handleRemove(proposalId: string) {
    startTransition(async () => {
      await removeProposal(proposalId);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      {/* Header: Kunden-Info */}
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

      {/* Confirmed VideoMeeting */}
      {match.videoMeetings.length > 0 && (
        <div className="px-5 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 text-blue-700">
            <Video className="w-4 h-4" />
            <span className="text-sm font-semibold">Bestätigter Videotermin</span>
          </div>
          {match.videoMeetings.map((vm) => (
            <div key={vm.id} className="mt-2 text-sm text-blue-600">
              {format(vm.scheduledAt, "EEEE, dd. MMMM yyyy · HH:mm 'Uhr'", { locale: de })} ({vm.durationMin} Min.)
              {" · "}
              <a href={vm.roomUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                Beitreten
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Proposals section */}
      <div className="p-5 space-y-3">
        {/* Kunde's counter-proposals */}
        {kundeProposals.length > 0 && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-green-700">
              Gegenvorschläge des Kunden
            </p>
            {kundeProposals.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {format(p.proposedAt, "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })} ({p.durationMin} Min.)
              </div>
            ))}
            <p className="text-xs text-green-600/70 mt-1">
              Der Vermittler wählt einen dieser Termine aus dem Backend.
            </p>
          </div>
        )}

        {/* Own proposals */}
        {openProposals.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#2D2D2D]/70">Ihre Terminvorschläge</p>
            {openProposals.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 bg-[#FAF6F1] rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-[#2D2D2D]">
                  <Calendar className="w-4 h-4 text-[#C06B4A]" />
                  {format(p.proposedAt, "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })} ({p.durationMin} Min.)
                </div>
                {!emailSent && (
                  <button
                    onClick={() => handleRemove(p.id)}
                    disabled={isPending}
                    className="text-[#2D2D2D]/30 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status indicator */}
        {emailSent && kundeProposals.length === 0 && match.videoMeetings.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4" />
            E-Mail an Kunden gesendet – warte auf Antwort
          </div>
        )}

        {match.status === "PROPOSED" && !emailSent && kundeProposals.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-[#2D2D2D]/50">
            <Clock className="w-3.5 h-3.5" />
            {openProposals.length}/3 Vorschläge – E-Mail wird nach dem 3. Vorschlag gesendet
          </div>
        )}

        {/* Add proposal form */}
        {canAddProposal && (
          <div>
            {showForm ? (
              <div className="border border-[#EAD9C8] rounded-xl p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2D]/60 mb-1">
                      Datum & Uhrzeit
                    </label>
                    <input
                      type="datetime-local"
                      value={proposedAt}
                      onChange={(e) => setProposedAt(e.target.value)}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      className="w-full rounded-lg border border-[#EAD9C8] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2D2D2D]/60 mb-1">
                      Dauer
                    </label>
                    <select
                      value={durationMin}
                      onChange={(e) => setDurationMin(Number(e.target.value) as 30 | 60)}
                      className="w-full rounded-lg border border-[#EAD9C8] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
                    >
                      <option value={30}>30 Minuten</option>
                      <option value={60}>60 Minuten</option>
                    </select>
                  </div>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddProposal}
                    disabled={isPending || !proposedAt}
                    className="flex-1 bg-[#C06B4A] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#A05438] disabled:opacity-50 transition-colors"
                  >
                    {isPending ? "Wird gespeichert..." : "Vorschlag hinzufügen"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 text-sm text-[#C06B4A] hover:text-[#A05438] transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Termin vorschlagen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
