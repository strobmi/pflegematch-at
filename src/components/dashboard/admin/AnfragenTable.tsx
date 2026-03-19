"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronDown, ChevronUp, Building2, Check, Loader2 } from "lucide-react";
import { assignMatchRequest, markProcessed } from "@/app/(dashboard)/admin/anfragen/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Request {
  id: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  careNeedsRaw: string | null;
  pflegegeldStufe: string | null;
  notes: string | null;
  createdAt: Date;
  tenantId: string | null;
  tenant: { id: string; name: string } | null;
  assignedTo: { name: string | null } | null;
}

interface Tenant {
  id: string;
  name: string;
}

interface Props {
  requests: Request[];
  tenants: Tenant[];
  showAssigned?: boolean;
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

function parseRaw(raw: string | null): Record<string, unknown> {
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function AnfrageRow({ req, tenants, showAssigned }: { req: Request; tenants: Tenant[]; showAssigned?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(req.tenantId ?? "");
  const [assigning, setAssigning] = useState(false);
  const [processing, setProcessing] = useState(false);

  const raw = parseRaw(req.careNeedsRaw);

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
      <tr className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setExpanded((e) => !e)}>
        <td className="px-4 py-3">
          <p className="font-medium text-white">{req.contactName ?? "–"}</p>
          <p className="text-xs text-white/40">{req.contactEmail ?? "–"}</p>
        </td>
        <td className="px-4 py-3 text-white/60 hidden md:table-cell text-sm">
          {BETREUUNGSART[(raw.betreuungsart as string) ?? ""] ?? (raw.betreuungsart as string) ?? "–"}
        </td>
        <td className="px-4 py-3 text-white/60 hidden lg:table-cell text-sm">
          {(raw.ort as string) || "–"}
        </td>
        <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">
          {format(new Date(req.createdAt), "dd.MM.yy HH:mm", { locale: de })}
        </td>
        {showAssigned && (
          <td className="px-4 py-3 text-xs hidden lg:table-cell">
            <span className="text-[#A8C5A8]">{req.tenant?.name}</span>
            {req.assignedTo?.name && (
              <p className="text-white/30 mt-0.5">→ {req.assignedTo.name}</p>
            )}
          </td>
        )}
        <td className="px-4 py-3 text-right">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-white/30 ml-auto" />
            : <ChevronDown className="w-4 h-4 text-white/30 ml-auto" />
          }
        </td>
      </tr>

      {expanded && (
        <tr className="bg-white/[0.03]">
          <td colSpan={showAssigned ? 6 : 5} className="px-4 pb-5 pt-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

              {/* Kontakt */}
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Kontakt</p>
                <p className="text-sm text-white">{req.contactName ?? "–"}</p>
                <p className="text-sm text-white/60">{req.contactEmail ?? "–"}</p>
                <p className="text-sm text-white/60">{req.contactPhone ?? "–"}</p>
              </div>

              {/* Pflegebedarf */}
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Pflegebedarf</p>
                <Detail label="Für wen" value={FUER_WEN[(raw.fuerWen as string) ?? ""] ?? (raw.fuerWen as string)} />
                <Detail label="Betreuung" value={BETREUUNGSART[(raw.betreuungsart as string) ?? ""] ?? (raw.betreuungsart as string)} />
                <Detail label="Pflegestufe" value={(raw.pflegestufe as string)?.replace("stufe_", "Stufe ").replace("keine", "Kein Pflegegeld").replace("unbekannt", "Unbekannt")} />
                <Detail label="Mobilität" value={(raw.mobilitaet as string)?.replace("selbstaendig", "Selbständig").replace("mit_hilfe", "Mit Unterstützung").replace("rollstuhl", "Rollstuhl").replace("bettlaegerig", "Bettlägerig")} />
                <Detail label="Demenz" value={(raw.demenz as string)?.replace("nein", "Nein").replace("leicht", "Leichte Anzeichen").replace("ja", "Ja")} />
              </div>

              {/* Zeitplan & Standort */}
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Zeitplan & Standort</p>
                <Detail label="Unterkunft" value={(raw.unterkunft as string) === "ja" ? "Vorhanden" : (raw.unterkunft as string) === "nein" ? "Nicht vorhanden" : undefined} />
                <Detail label="Ab wann" value={(raw.startZeit as string)?.replace("sofort", "So bald wie möglich").replace("ein_zwei_wochen", "1–2 Wochen").replace("ein_monat", "1 Monat").replace("unklar", "Unklar")} />
                <Detail label="Wie lange" value={(raw.dauer as string)?.replace("dauerhaft", "Dauerhaft").replace("monate", "Mehrere Monate").replace("wochen", "Einige Wochen").replace("unklar", "Unklar")} />
                <Detail label="Ort" value={raw.ort as string} />
                <Detail label="Sprachen" value={
                  Array.isArray(raw.sprachen) && raw.sprachen.length > 0
                    ? (raw.sprachen as Array<{ lang: string; level: string }>)
                        .map((s) => `${s.lang} (${s.level === "muttersprache" ? "Muttersprache" : s.level === "fliessend" ? "Fließend" : "Grundkenntnisse"})`)
                        .join(", ")
                    : undefined
                } />
              </div>
            </div>

            {/* Nachricht */}
            {req.notes && (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">Persönliche Nachricht</p>
                <p className="text-sm text-white/70 leading-relaxed">{req.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {!showAssigned && (
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
                    onClick={handleAssign}
                    disabled={!selectedTenant || assigning}
                    className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
                    Zuweisen
                  </button>
                </>
              )}
              <button
                onClick={handleMarkProcessed}
                disabled={processing}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white/70 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Als erledigt markieren
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
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

// ─── Table ────────────────────────────────────────────────────────────────────

export default function AnfragenTable({ requests, tenants, showAssigned }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Kontakt</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Betreuung</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Ort</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Eingegangen</th>
            {showAssigned && (
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Zugewiesen an</th>
            )}
            <th className="px-4 py-3 w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {requests.map((r) => (
            <AnfrageRow key={r.id} req={r} tenants={tenants} showAssigned={showAssigned} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
