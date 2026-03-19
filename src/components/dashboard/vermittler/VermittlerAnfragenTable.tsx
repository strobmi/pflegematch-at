"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronDown, ChevronUp, Check, Loader2, Search, Link2 } from "lucide-react";
import { markAnfrageProcessed, createMatchFromAnfrage } from "@/app/(dashboard)/vermittler/anfragen/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Anfrage {
  id: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  careNeedsRaw: string | null;
  notes: string | null;
  isProcessed: boolean;
  createdAt: Date;
  assignedTo:  { name: string | null } | null;
  processedBy: { name: string | null } | null;
}

interface Pfleger {
  id: string;
  user: { name: string | null };
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

// ─── Row ──────────────────────────────────────────────────────────────────────

function AnfrageRow({ req, pfleger, showBadge }: { req: Anfrage; pfleger: Pfleger[]; showBadge: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [matching, setMatching]   = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [selectedPfleger, setSelectedPfleger] = useState("");
  const raw = parseRaw(req.careNeedsRaw);

  async function handleMarkProcessed() {
    setProcessing(true);
    await markAnfrageProcessed(req.id);
    setProcessing(false);
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
        <td className="px-4 py-3 text-right">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-[#2D2D2D]/30 ml-auto" />
            : <ChevronDown className="w-4 h-4 text-[#2D2D2D]/30 ml-auto" />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#FAF6F1]/60">
          <td colSpan={6} className="px-4 pb-5 pt-2">
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

            {!req.isProcessed && (
              <div className="space-y-3">
                {/* Match erstellen */}
                <div>
                  <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-2">Matchvorschlag erstellen</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedPfleger}
                      onChange={(e) => setSelectedPfleger(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#C06B4A] transition-colors cursor-pointer"
                    >
                      <option value="">Pflegekraft auswählen…</option>
                      {pfleger.map((p) => (
                        <option key={p.id} value={p.id}>{p.user.name ?? p.id}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleCreateMatch}
                      disabled={!selectedPfleger || matching}
                      className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                    >
                      {matching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                      Match erstellen
                    </button>
                  </div>
                  {matchError && <p className="text-xs text-red-500 mt-1">{matchError}</p>}
                  {pfleger.length === 0 && (
                    <p className="text-xs text-[#2D2D2D]/40 mt-1">Keine aktiven Pflegekräfte vorhanden.</p>
                  )}
                </div>

                {/* Ohne Match abschließen */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#EAD9C8]">
                  <span className="text-xs text-[#2D2D2D]/35">Ohne Match abschließen:</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkProcessed(); }}
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 text-xs text-[#2D2D2D]/40 hover:text-[#2D2D2D] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Als erledigt markieren
                  </button>
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

  const offenCount    = requests.filter((r) => !r.isProcessed).length;
  const erledigtCount = requests.filter((r) => r.isProcessed).length;

  const filtered = requests.filter((r) => {
    // Tab filter
    if (tab === "offen"    && r.isProcessed)  return false;
    if (tab === "erledigt" && !r.isProcessed) return false;

    // Betreuungsart filter
    if (betreuungsFilter) {
      const raw = parseRaw(r.careNeedsRaw);
      if ((raw.betreuungsart as string) !== betreuungsFilter) return false;
    }

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      const raw = parseRaw(r.careNeedsRaw);
      const haystack = [
        r.contactName, r.contactEmail, raw.ort as string,
      ].join(" ").toLowerCase();
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
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, E-Mail oder Ort suchen…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-[#2D2D2D]/35"
            />
          </div>
          {/* Betreuungsart filter */}
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
        </div>

        {/* Tabs */}
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

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Kontakt</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Betreuung</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Ort</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Eingegangen</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">
              Bearbeiter
            </th>
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EAD9C8]">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-[#2D2D2D]/35 text-sm">
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
