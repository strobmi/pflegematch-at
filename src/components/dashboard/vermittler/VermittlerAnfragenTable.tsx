"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronDown, ChevronUp, Check, Loader2, Search, Link2, RotateCcw, UserCheck } from "lucide-react";
import { markAnfrageProcessed, createMatchFromAnfrage, reopenAnfrage } from "@/app/(dashboard)/vermittler/anfragen/actions";
import { computeScore, type ScoreResult } from "@/lib/scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

const CLOSED_REASON_LABELS: Record<string, string> = {
  KEIN_INTERESSE:       "Kein Interesse / Absage durch Lead",
  ANDERWEITIG_VERSORGT: "Anderweitig versorgt",
  KEIN_PFLEGER:         "Kein passender Pfleger verfügbar",
  NICHT_ERREICHBAR:     "Lead nicht erreichbar",
  SONSTIGES:            "Sonstiges",
};

interface Anfrage {
  id: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  careNeedsRaw: string | null;
  pflegegeldStufe: string | null;
  notes: string | null;
  isProcessed: boolean;
  clientProfileId: string | null;
  closedReason: string | null;
  closedNote: string | null;
  createdAt: Date;
  assignedTo:  { name: string | null } | null;
  processedBy: { name: string | null } | null;
}

interface Pfleger {
  id: string;
  user: { name: string | null };
  pflegestufe: string[];
  languages: string[];
  availability: string;
  averageRating: number | null;
  currentAvailabilityStatus: string | null;
}

// ─── Label helpers ────────────────────────────────────────────────────────────

const BETREUUNGSART: Record<string, string> = {
  "24h": "24h-Pflege", stundenweise: "Stundenweise",
  tagesbetreuung: "Tagesbetreuung", nachtsitzung: "Nachtsitzung",
};
const FUER_WEN: Record<string, string> = {
  ich: "Für sich selbst", elternteil: "Für Mutter/Vater",
  partner: "Für Partner/-in", andere: "Für jemand anderen",
};
const MOBILITAET: Record<string, string> = {
  selbstaendig: "Selbständig", mit_hilfe: "Mit Unterstützung",
  rollstuhl: "Rollstuhl", bettlaegerig: "Bettlägerig",
};
const START_ZEIT: Record<string, string> = {
  sofort: "So bald wie möglich", ein_zwei_wochen: "1–2 Wochen",
  ein_monat: "1 Monat", unklar: "Noch unklar",
};
const DAUER: Record<string, string> = {
  dauerhaft: "Dauerhaft", monate: "Mehrere Monate",
  wochen: "Einige Wochen", unklar: "Noch unklar",
};

function parseRaw(raw: string | null): Record<string, unknown> {
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-xs text-[#2D2D2D]/40 shrink-0 w-20">{label}</span>
      <span className="text-xs text-[#2D2D2D]/70">{value}</span>
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 70) return "#7B9E7B";
  if (score >= 40) return "#D97706";
  return "#9CA3AF";
}

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#EAD9C8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function BreakdownChip({ ok, label, failLabel }: { ok: boolean; label: string; failLabel?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
        ok
          ? "bg-[#7B9E7B]/15 text-[#5A7A5A]"
          : "bg-[#2D2D2D]/6 text-[#2D2D2D]/35"
      }`}
    >
      {ok ? "✓" : "✗"} {ok ? label : (failLabel ?? label)}
    </span>
  );
}

// ─── Scored Pfleger Card ──────────────────────────────────────────────────────

function PflegerCard({
  rank,
  pfleger,
  result,
  selected,
  onSelect,
}: {
  rank: number;
  pfleger: Pfleger;
  result: ScoreResult;
  selected: boolean;
  onSelect: () => void;
}) {
  const sprachenLabel =
    result.sprachen.total === 0
      ? null
      : `${result.sprachen.matched}/${result.sprachen.total} Sprache${result.sprachen.total !== 1 ? "n" : ""}`;

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`w-full text-left px-3.5 py-3 rounded-xl border-2 transition-all ${
        selected
          ? "border-[#C06B4A] bg-[#FDF5F0]"
          : result.score === 0
          ? "border-[#EAD9C8] bg-white opacity-50 hover:opacity-75"
          : "border-[#EAD9C8] bg-white hover:border-[#C06B4A]/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-[#C06B4A] shrink-0">#{rank}</span>
          <span className="text-sm font-semibold text-[#2D2D2D] truncate">
            {pfleger.user.name ?? "–"}
          </span>
        </div>
        <span className="text-xs text-[#2D2D2D]/35 shrink-0">/100</span>
      </div>
      <ScoreBar score={result.score} />
      <div className="flex flex-wrap gap-1 mt-2">
        <BreakdownChip ok={result.pflegestufe} label="Pflegestufe" />
        <BreakdownChip ok={result.betreuungsart} label="Betreuungsart" />
        {sprachenLabel && (
          <BreakdownChip ok={result.sprachen.matched === result.sprachen.total} label={sprachenLabel} />
        )}
        <BreakdownChip ok={result.verfuegbarkeit} label="Verfügbarkeit" failLabel="Verfügbarkeit prüfen" />
      </div>
    </button>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function AnfrageRow({ req, pfleger, showBadge }: { req: Anfrage; pfleger: Pfleger[]; showBadge: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reopening, setReopening]   = useState(false);
  const [matching, setMatching]   = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [selectedPfleger, setSelectedPfleger] = useState("");
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [closedReason, setClosedReason] = useState<string>("");
  const [closedNote, setClosedNote] = useState("");
  const raw = parseRaw(req.careNeedsRaw);

  // Scores berechnen und nach Score DESC sortieren
  const scoredPfleger = pfleger
    .map((p) => ({
      pfleger: p,
      result: computeScore(
        { ...p, currentAvailabilityStatus: p.currentAvailabilityStatus },
        { pflegegeldStufe: req.pflegegeldStufe, careNeedsRaw: req.careNeedsRaw }
      ),
    }))
    .sort((a, b) =>
      b.result.score !== a.result.score
        ? b.result.score - a.result.score
        : (a.pfleger.user.name ?? "").localeCompare(b.pfleger.user.name ?? "")
    );

  async function handleMarkProcessed(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!closedReason) return;
    setProcessing(true);
    await markAnfrageProcessed(
      req.id,
      closedReason as "KEIN_INTERESSE" | "ANDERWEITIG_VERSORGT" | "KEIN_PFLEGER" | "NICHT_ERREICHBAR" | "SONSTIGES",
      closedNote,
    );
    setProcessing(false);
  }

  async function handleReopen(e: React.MouseEvent) {
    e.stopPropagation();
    setReopening(true);
    await reopenAnfrage(req.id);
    setReopening(false);
  }

  async function handleCreateMatch(e: React.MouseEvent) {
    e.stopPropagation();
    if (!selectedPfleger) return;
    setMatching(true);
    setMatchError(null);
    const result = await createMatchFromAnfrage(req.id, selectedPfleger);
    if (result?.error) {
      setMatchError(result.error);
      setMatching(false);
    }
  }

  return (
    <>
      <tr
        onClick={() => setExpanded((e) => !e)}
        className={`transition-colors cursor-pointer ${req.isProcessed && showBadge ? "opacity-55 hover:opacity-100" : "hover:bg-[#FAF6F1]"}`}
      >
        <td className="px-4 py-3">
          <p className="font-medium text-[#2D2D2D]">{req.contactName ?? "–"}</p>
          <p className="text-xs text-[#2D2D2D]/45">{req.contactEmail ?? "–"}</p>
        </td>
        <td className="px-4 py-3 text-[#2D2D2D]/60 text-sm hidden md:table-cell">
          {BETREUUNGSART[(raw.betreuungsart as string) ?? ""] ?? (raw.betreuungsart as string) ?? "–"}
        </td>
        <td className="px-4 py-3 text-[#2D2D2D]/60 text-sm hidden lg:table-cell">
          {(raw.ort as string) || "–"}
        </td>
        <td className="px-4 py-3 text-[#2D2D2D]/40 text-xs hidden md:table-cell">
          {format(new Date(req.createdAt), "dd.MM.yy HH:mm", { locale: de })}
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          {req.isProcessed && req.processedBy?.name
            ? <span className="text-xs text-[#2D2D2D]/50">{req.processedBy.name}</span>
            : null}
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          {req.isProcessed && !req.clientProfileId && req.closedReason ? (
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[#2D2D2D]/6 text-[#2D2D2D]/50 whitespace-nowrap">
              {CLOSED_REASON_LABELS[req.closedReason]}
            </span>
          ) : req.isProcessed && req.clientProfileId ? (
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[#7B9E7B]/15 text-[#5A7A5A] whitespace-nowrap">
              Kunde angelegt
            </span>
          ) : null}
        </td>
        <td className="px-4 py-3 text-right">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-[#2D2D2D]/30 ml-auto" />
            : <ChevronDown className="w-4 h-4 text-[#2D2D2D]/30 ml-auto" />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#FAF6F1]/60">
          <td colSpan={7} className="px-4 pb-5 pt-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-xl border border-[#EAD9C8] p-4 space-y-1.5">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-2">Kontakt</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{req.contactName ?? "–"}</p>
                <p className="text-sm text-[#2D2D2D]/60">{req.contactEmail ?? "–"}</p>
                <p className="text-sm text-[#2D2D2D]/60">{req.contactPhone ?? "–"}</p>
              </div>
              <div className="bg-white rounded-xl border border-[#EAD9C8] p-4 space-y-1.5">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-2">Pflegebedarf</p>
                <Detail label="Für wen"     value={FUER_WEN[(raw.fuerWen as string) ?? ""]} />
                <Detail label="Betreuung"   value={BETREUUNGSART[(raw.betreuungsart as string) ?? ""]} />
                <Detail label="Pflegestufe" value={(raw.pflegestufe as string)?.replace("stufe_", "Stufe ").replace("keine", "Kein Pflegegeld").replace("unbekannt", "Unbekannt")} />
                <Detail label="Mobilität"   value={MOBILITAET[(raw.mobilitaet as string) ?? ""]} />
                <Detail label="Demenz"      value={(raw.demenz as string) === "nein" ? "Nein" : (raw.demenz as string) === "leicht" ? "Leichte Anzeichen" : (raw.demenz as string) === "ja" ? "Ja, diagnostiziert" : undefined} />
                <Detail label="Unterkunft"  value={(raw.unterkunft as string) === "ja" ? "Vorhanden" : (raw.unterkunft as string) === "nein" ? "Nicht vorhanden" : undefined} />
              </div>
              <div className="bg-white rounded-xl border border-[#EAD9C8] p-4 space-y-1.5">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-2">Zeitplan & Standort</p>
                <Detail label="Ab wann"   value={START_ZEIT[(raw.startZeit as string) ?? ""]} />
                <Detail label="Wie lange" value={DAUER[(raw.dauer as string) ?? ""]} />
                <Detail label="Ort"       value={raw.ort as string} />
                <Detail label="Sprachen"  value={
                  Array.isArray(raw.sprachen) && raw.sprachen.length > 0
                    ? (raw.sprachen as Array<{ lang: string; level: string }>)
                        .map((s) => `${s.lang} (${s.level === "muttersprache" ? "Muttersprache" : s.level === "fliessend" ? "Fließend" : "Grundkenntnisse"})`)
                        .join(", ")
                    : undefined
                } />
              </div>
            </div>

            {req.notes && (
              <div className="bg-white rounded-xl border border-[#EAD9C8] p-4 mb-4">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-1.5">Persönliche Nachricht</p>
                <p className="text-sm text-[#2D2D2D]/70 leading-relaxed">{req.notes}</p>
              </div>
            )}

            {req.isProcessed && !req.clientProfileId && (
              <div className="mt-1 pt-3 border-t border-[#EAD9C8] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#2D2D2D]/70">Ohne Match abgeschlossen</p>
                    {req.closedReason && (
                      <p className="text-xs text-[#2D2D2D]/55 mt-0.5">
                        Grund: {CLOSED_REASON_LABELS[req.closedReason] ?? req.closedReason}
                      </p>
                    )}
                    {req.closedNote && (
                      <p className="text-xs text-[#2D2D2D]/45 mt-0.5 italic">{req.closedNote}</p>
                    )}
                    {!req.closedReason && (
                      <p className="text-xs text-[#2D2D2D]/40 mt-0.5">Kein Kundenprofil angelegt · Anfrage kann wieder geöffnet werden</p>
                    )}
                  </div>
                  <button
                    onClick={handleReopen}
                    disabled={reopening}
                    className="inline-flex items-center gap-2 shrink-0 border border-[#C06B4A] text-[#C06B4A] hover:bg-[#C06B4A] hover:text-white disabled:opacity-40 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {reopening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    Wieder öffnen
                  </button>
                </div>
              </div>
            )}

            {req.isProcessed && req.clientProfileId && (
              <div className="flex items-center gap-3 mt-1 pt-3 border-t border-[#EAD9C8]">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#7B9E7B]/15 shrink-0">
                  <UserCheck className="w-4 h-4 text-[#7B9E7B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D2D2D]/70">Kunde wurde angelegt</p>
                  <p className="text-xs text-[#2D2D2D]/40 mt-0.5">Diese Anfrage wurde mit einem Match abgeschlossen · Wiedereröffnung nicht möglich</p>
                </div>
              </div>
            )}

            {!req.isProcessed && (
              <div className="space-y-3">
                {/* Scored Pfleger Cards */}
                {pfleger.length === 0 ? (
                  <p className="text-xs text-[#2D2D2D]/40">Keine aktiven Pflegekräfte vorhanden.</p>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide">
                        Passende Pflegekräfte
                      </p>
                      <span className="text-xs text-[#2D2D2D]/30">
                        {pfleger.length} verfügbar
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {scoredPfleger.map(({ pfleger: p, result }, i) => (
                        <PflegerCard
                          key={p.id}
                          rank={i + 1}
                          pfleger={p}
                          result={result}
                          selected={selectedPfleger === p.id}
                          onSelect={() => setSelectedPfleger(prev => prev === p.id ? "" : p.id)}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      {matchError && (
                        <p className="text-xs text-red-500 flex-1">{matchError}</p>
                      )}
                      <button
                        onClick={handleCreateMatch}
                        disabled={!selectedPfleger || matching}
                        className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                      >
                        {matching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                        Match erstellen
                      </button>
                    </div>
                  </div>
                )}

                {/* Ohne Match abschließen */}
                <div className="pt-3 border-t border-[#EAD9C8]">
                  {!showCloseForm ? (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#2D2D2D]/70">Ohne Match abschließen</p>
                        <p className="text-xs text-[#2D2D2D]/40 mt-0.5">Anfrage als erledigt markieren ohne eine Pflegekraft zuzuweisen</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowCloseForm(true); }}
                        className="inline-flex items-center gap-2 shrink-0 border border-[#2D2D2D]/20 text-[#2D2D2D]/50 hover:border-[#2D2D2D]/40 hover:text-[#2D2D2D] px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Als erledigt markieren
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleMarkProcessed} onClick={(e) => e.stopPropagation()} className="space-y-3">
                      <p className="text-sm font-medium text-[#2D2D2D]/70">Ohne Match abschließen</p>
                      <div>
                        <label className="block text-xs font-medium text-[#2D2D2D]/60 mb-1">Grund *</label>
                        <select
                          required
                          value={closedReason}
                          onChange={(e) => setClosedReason(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors"
                        >
                          <option value="">– Bitte wählen –</option>
                          {Object.entries(CLOSED_REASON_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#2D2D2D]/60 mb-1">Notiz (optional)</label>
                        <textarea
                          value={closedNote}
                          onChange={(e) => setClosedNote(e.target.value)}
                          rows={2}
                          placeholder="Zusätzliche Informationen..."
                          className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors resize-none placeholder:text-[#2D2D2D]/30"
                        />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowCloseForm(false)}
                          className="px-3.5 py-2 rounded-xl text-sm text-[#2D2D2D]/50 hover:text-[#2D2D2D] transition-colors"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          disabled={processing || !closedReason}
                          className="inline-flex items-center gap-2 bg-[#2D2D2D]/80 hover:bg-[#2D2D2D] disabled:opacity-40 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                        >
                          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Abschließen
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

type Tab = "offen" | "erledigt" | "alle";

export default function VermittlerAnfragenTable({ requests, pfleger }: { requests: Anfrage[]; pfleger: Pfleger[] }) {
  const [tab, setTab] = useState<Tab>("offen");
  const [search, setSearch] = useState("");
  const [betreuungsFilter, setBetreuungsFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");

  const offenCount    = requests.filter((r) => !r.isProcessed).length;
  const erledigtCount = requests.filter((r) => r.isProcessed).length;

  const filtered = requests.filter((r) => {
    if (tab === "offen"    && r.isProcessed)  return false;
    if (tab === "erledigt" && !r.isProcessed) return false;

    if (betreuungsFilter) {
      const raw = parseRaw(r.careNeedsRaw);
      if ((raw.betreuungsart as string) !== betreuungsFilter) return false;
    }

    if (reasonFilter) {
      if (r.closedReason !== reasonFilter) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const raw = parseRaw(r.careNeedsRaw);
      const reasonLabel = r.closedReason ? CLOSED_REASON_LABELS[r.closedReason] : "";
      const haystack = [r.contactName, r.contactEmail, raw.ort as string, reasonLabel, r.closedNote].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "offen",    label: "Offen",    count: offenCount },
    { key: "erledigt", label: "Erledigt", count: erledigtCount },
    { key: "alle",     label: "Alle",     count: requests.length },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 pt-4 pb-3 border-b border-[#EAD9C8] space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, E-Mail oder Ort suchen…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-[#2D2D2D]/35"
            />
          </div>
          <select
            value={betreuungsFilter}
            onChange={(e) => setBetreuungsFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors text-[#2D2D2D]/70 cursor-pointer"
          >
            <option value="">Alle Betreuungsarten</option>
            <option value="24h">24h-Pflege</option>
            <option value="stundenweise">Stundenweise</option>
            <option value="tagesbetreuung">Tagesbetreuung</option>
            <option value="nachtsitzung">Nachtsitzung</option>
          </select>
          {(tab === "erledigt" || tab === "alle") && (
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors text-[#2D2D2D]/70 cursor-pointer"
            >
              <option value="">Alle Abschlussgründe</option>
              {Object.entries(CLOSED_REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex gap-1">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                tab === key
                  ? "bg-[#C06B4A]/10 text-[#C06B4A]"
                  : "text-[#2D2D2D]/50 hover:bg-[#FAF6F1] hover:text-[#2D2D2D]"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-[#C06B4A]/15 text-[#C06B4A]" : "bg-[#EAD9C8] text-[#2D2D2D]/50"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Kontakt</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Betreuung</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Ort</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Eingegangen</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Bearbeiter</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Erledigungsgrund</th>
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAD9C8]">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-[#2D2D2D]/35 text-sm">
                {search || betreuungsFilter ? "Keine Treffer für diese Filtereinstellungen." : "Keine Anfragen vorhanden."}
              </td>
            </tr>
          ) : (
            filtered.map((r) => (
              <AnfrageRow key={r.id} req={r} pfleger={pfleger} showBadge={tab === "alle"} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
