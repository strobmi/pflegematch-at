"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, CheckCircle, Clock, Plus, Trash2 } from "lucide-react";
import { addProposal, removeProposal, selectAlternativeProposal } from "@/app/(dashboard)/vermittler/matches/proposal-actions";

interface Proposal {
  id: string;
  proposedAt: Date;
  durationMin: number;
  status: string;
  proposedBy: string;
}

export default function VermittlerProposalSection({
  matchId,
  proposals,
}: {
  matchId: string;
  proposals: Proposal[];
}) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [proposedAt, setProposedAt] = useState("");
  const [durationMin, setDurationMin] = useState<30 | 60>(30);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const pfVermProposals = proposals.filter(
    (p) => p.status === "OPEN" && (p.proposedBy === "PFLEGER" || p.proposedBy === "VERMITTLER")
  );
  const kundeProposals = proposals.filter(
    (p) => p.status === "OPEN" && p.proposedBy === "KUNDE"
  );
  const emailSent = pfVermProposals.length >= 3;
  const canAdd = !emailSent && pfVermProposals.length < 3 && kundeProposals.length === 0;

  function handleAdd() {
    if (!proposedAt) return;
    setError(null);
    startTransition(async () => {
      const result = await addProposal({ matchId, proposedAt, durationMin, role: "VERMITTLER" });
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

  function handleSelectAlternative(proposalId: string) {
    setError(null);
    startTransition(async () => {
      const result = await selectAlternativeProposal(proposalId);
      if (result && "error" in result) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  }

  if (proposals.filter((p) => p.status === "OPEN").length === 0 && !canAdd) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[#2D2D2D]">Terminvorschläge</h2>

      {/* Kunde counter-proposals */}
      {kundeProposals.length > 0 && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
          <p className="text-sm font-semibold text-green-700">
            Gegenvorschläge des Kunden – bitte einen bestätigen:
          </p>
          {kundeProposals.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Calendar className="w-4 h-4" />
                {format(p.proposedAt, "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })} ({p.durationMin} Min.)
              </div>
              <button
                onClick={() => handleSelectAlternative(p.id)}
                disabled={isPending}
                className="bg-green-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Bestätigen
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pfleger/Vermittler proposals */}
      {pfVermProposals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#2D2D2D]/60">
            Vorschläge an Kunde ({pfVermProposals.length}/3)
          </p>
          {pfVermProposals.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 bg-[#FAF6F1] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-[#2D2D2D]">
                <Calendar className="w-4 h-4 text-[#C06B4A]" />
                {format(p.proposedAt, "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })} ({p.durationMin} Min.)
                <span className="text-xs text-[#2D2D2D]/40">
                  ({p.proposedBy === "PFLEGER" ? "Pfleger" : "Vermittler"})
                </span>
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

      {/* Status */}
      {emailSent && kundeProposals.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4" />
          E-Mail an Kunden gesendet – warte auf Antwort
        </div>
      )}

      {pfVermProposals.length > 0 && !emailSent && (
        <div className="flex items-center gap-2 text-xs text-[#2D2D2D]/50">
          <Clock className="w-3.5 h-3.5" />
          {pfVermProposals.length}/3 – E-Mail wird nach dem 3. Vorschlag gesendet
        </div>
      )}

      {/* Add form */}
      {canAdd && (
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
                  onClick={handleAdd}
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
  );
}
