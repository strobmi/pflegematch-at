"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronDown, ChevronUp, Building2, Check, Loader2, Search } from "lucide-react";
import { assignMatchRequest, markProcessed } from "@/app/(dashboard)/admin/anfragen/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Request {
  id: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  careNeedsRaw: string | null;
  notes: string | null;
  isProcessed: boolean;
  createdAt: Date;
  tenant: { id: string; name: string; isPlatform: boolean } | null;
  assignedTo: { name: string | null } | null;
}

interface Tenant {
  id: string;
  name: string;
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
      <span className="text-xs text-white/35 shrink-0 w-20">{label}</span>
      <span className="text-xs text-white/70">{value}</span>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function AnfrageRow({ req, tenants, showBadge }: { req: Request; tenants: Tenant[]; showBadge: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(
    req.tenant && !req.tenant.isPlatform ? req.tenant.id : ""
  );
  const [assigning, setAssigning]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const raw = parseRaw(req.careNeedsRaw);
  const isUnassigned = req.tenant?.isPlatform === true;

  async function handleAssign() {
    if (!selectedTenant) return;
    setAssigning(true);
    await assignMatchRequest(req.id, selectedTenant);
    setAssigning(false);
  }

  async function handleMarkProcessed() {
    setProcessing(true);
    await markProcessed(req.id);
    setProcessing(false);
  }

  return (
    <>
      <tr
        onClick={() => setExpanded((e) => !e)}
        className={`transition-colors cursor-pointer ${req.isProcessed && showBadge ? "opacity-50 hover:opacity-100" : "hover:bg-white/5"}`}
      >
        <td className="px-4 py-3">
          <p className="font-medium text-white">{req.contactName ?? "–"}</p>
          <p className="text-xs text-white/40">{req.contactEmail ?? "–"}</p>
        </td>
        <td className="px-4 py-3 text-white/60 text-sm hidden md:table-cell">
          {BETREUUNGSART[(raw.betreuungsart as string) ?? ""] ?? (raw.betreuungsart as string) ?? "–"}
        </td>
        <td className="px-4 py-3 text-white/60 text-sm hidden lg:table-cell">
          {(raw.ort as string) || "–"}
        </td>
        <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">
          {format(new Date(req.createdAt), "dd.MM.yy HH:mm", { locale: de })}
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          {showBadge ? (
            req.isProcessed
              ? <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 font-medium">Erledigt</span>
              : isUnassigned
                ? <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">Nicht zugewiesen</span>
                : <span className="text-xs px-2 py-0.5 rounded-full bg-[#7B9E7B]/20 text-[#A8C5A8] font-medium">Zugewiesen</span>
          ) : isUnassigned ? (
            <span className="text-xs text-white/30 italic">–</span>
          ) : (
            <div>
              <span className="text-xs text-[#A8C5A8]">{req.tenant?.name}</span>
              {req.assignedTo?.name && (
                <p className="text-white/30 text-xs mt-0.5">→ {req.assignedTo.name}</p>
              )}
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-white/30 ml-auto" />
            : <ChevronDown className="w-4 h-4 text-white/30 ml-auto" />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-white/[0.03]">
          <td colSpan={6} className="px-4 pb-5 pt-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Kontakt</p>
                <p className="text-sm text-white">{req.contactName ?? "–"}</p>
                <p className="text-sm text-white/60">{req.contactEmail ?? "–"}</p>
                <p className="text-sm text-white/60">{req.contactPhone ?? "–"}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Pflegebedarf</p>
                <Detail label="Für wen"     value={FUER_WEN[(raw.fuerWen as string) ?? ""]} />
                <Detail label="Betreuung"   value={BETREUUNGSART[(raw.betreuungsart as string) ?? ""]} />
                <Detail label="Pflegestufe" value={(raw.pflegestufe as string)?.replace("stufe_", "Stufe ").replace("keine", "Kein Pflegegeld").replace("unbekannt", "Unbekannt")} />
                <Detail label="Mobilität"   value={MOBILITAET[(raw.mobilitaet as string) ?? ""]} />
                <Detail label="Demenz"      value={(raw.demenz as string) === "nein" ? "Nein" : (raw.demenz as string) === "leicht" ? "Leichte Anzeichen" : (raw.demenz as string) === "ja" ? "Ja, diagnostiziert" : undefined} />
                <Detail label="Unterkunft"  value={(raw.unterkunft as string) === "ja" ? "Vorhanden" : (raw.unterkunft as string) === "nein" ? "Nicht vorhanden" : undefined} />
              </div>
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Zeitplan & Standort</p>
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
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Persönliche Nachricht</p>
                <p className="text-sm text-white/70 leading-relaxed">{req.notes}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {/* Assign to tenant */}
              {!req.isProcessed && (
                <>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="bg-white/10 border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#C06B4A] cursor-pointer"
                  >
                    <option value="" className="bg-[#2D2D2D]">Vermittler auswählen…</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#2D2D2D]">{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAssign(); }}
                    disabled={!selectedTenant || assigning}
                    className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
                    {isUnassigned ? "Zuweisen" : "Neu zuweisen"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkProcessed(); }}
                    disabled={processing}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white/70 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Als erledigt markieren
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Table with toolbar ───────────────────────────────────────────────────────

type Tab = "unassigned" | "assigned" | "erledigt" | "alle";

export default function AnfragenTable({ requests, tenants }: { requests: Request[]; tenants: Tenant[] }) {
  const [tab, setTab]                   = useState<Tab>("unassigned");
  const [search, setSearch]             = useState("");
  const [betreuungsFilter, setBetreuungsFilter] = useState("");

  const counts = {
    unassigned: requests.filter((r) => !r.isProcessed && r.tenant?.isPlatform).length,
    assigned:   requests.filter((r) => !r.isProcessed && !r.tenant?.isPlatform).length,
    erledigt:   requests.filter((r) => r.isProcessed).length,
    alle:       requests.length,
  };

  const filtered = requests.filter((r) => {
    if (tab === "unassigned" && (r.isProcessed || !r.tenant?.isPlatform))   return false;
    if (tab === "assigned"   && (r.isProcessed || r.tenant?.isPlatform))    return false;
    if (tab === "erledigt"   && !r.isProcessed)                              return false;

    if (betreuungsFilter) {
      const raw = parseRaw(r.careNeedsRaw);
      if ((raw.betreuungsart as string) !== betreuungsFilter) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const raw = parseRaw(r.careNeedsRaw);
      const haystack = [r.contactName, r.contactEmail, raw.ort as string].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "unassigned", label: "Nicht zugewiesen" },
    { key: "assigned",   label: "Zugewiesen" },
    { key: "erledigt",   label: "Erledigt" },
    { key: "alle",       label: "Alle" },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, E-Mail oder Ort suchen…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-white/25"
            />
          </div>
          <select
            value={betreuungsFilter}
            onChange={(e) => setBetreuungsFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 focus:outline-none focus:border-[#C06B4A] transition-colors cursor-pointer"
          >
            <option value="" className="bg-[#2D2D2D]">Alle Betreuungsarten</option>
            <option value="24h" className="bg-[#2D2D2D]">24h-Pflege</option>
            <option value="stundenweise" className="bg-[#2D2D2D]">Stundenweise</option>
            <option value="tagesbetreuung" className="bg-[#2D2D2D]">Tagesbetreuung</option>
            <option value="nachtsitzung" className="bg-[#2D2D2D]">Nachtsitzung</option>
          </select>
        </div>
        <div className="flex gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                tab === key ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                tab === key ? "bg-white/15 text-white/80" : "bg-white/5 text-white/30"
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Kontakt</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Betreuung</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Ort</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Eingegangen</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">
              {tab === "alle" ? "Status" : tab === "assigned" ? "Zugewiesen an" : ""}
            </th>
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-white/25 text-sm">
                {search || betreuungsFilter ? "Keine Treffer für diese Filtereinstellungen." : "Keine Anfragen vorhanden."}
              </td>
            </tr>
          ) : (
            filtered.map((r) => (
              <AnfrageRow key={r.id} req={r} tenants={tenants} showBadge={tab === "alle"} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
