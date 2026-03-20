"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Search, Link2 } from "lucide-react";
import type { MatchStatus, ProvisionStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchRow {
  id: string;
  status: MatchStatus;
  provisionStatus: ProvisionStatus;
  provisionAmount: number | null;
  startDate: string | null;
  computedScore: number;
  scoreIsAuto: boolean;
  tenant: { name: string };
  caregiverProfile: { user: { name: string | null } };
  clientProfile:    { user: { name: string | null } };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  PROPOSED:  { label: "Vorgeschlagen", className: "bg-[#C06B4A]/20 text-[#C06B4A]" },
  PENDING:   { label: "Ausstehend",    className: "bg-amber-500/20 text-amber-300" },
  ACCEPTED:  { label: "Akzeptiert",    className: "bg-[#7B9E7B]/20 text-[#A8C5A8]" },
  ACTIVE:    { label: "Aktiv",         className: "bg-[#7B9E7B]/30 text-[#A8C5A8] font-semibold" },
  COMPLETED: { label: "Abgeschlossen", className: "bg-white/10 text-white/50" },
  CANCELLED: { label: "Storniert",     className: "bg-red-500/20 text-red-400" },
};

const PROVISION_CONFIG: Record<ProvisionStatus, { label: string; className: string }> = {
  PENDING:  { label: "Offen",      className: "bg-amber-500/20 text-amber-300" },
  INVOICED: { label: "Verrechnet", className: "bg-[#C06B4A]/20 text-[#C06B4A]" },
  PAID:     { label: "Bezahlt",    className: "bg-[#7B9E7B]/30 text-[#A8C5A8]" },
};

type Tab = "offen" | "laufend" | "abgeschlossen" | "alle";

const OFFEN_STATUSES:         MatchStatus[] = ["PROPOSED", "PENDING"];
const LAUFEND_STATUSES:       MatchStatus[] = ["ACCEPTED", "ACTIVE"];
const ABGESCHLOSSEN_STATUSES: MatchStatus[] = ["COMPLETED", "CANCELLED"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminMatchesTable({ matches }: { matches: MatchRow[] }) {
  const [tab, setTab]                     = useState<Tab>("laufend");
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<MatchStatus | "">("");
  const [provisionFilter, setProvisionFilter] = useState<ProvisionStatus | "">("");

  const counts = {
    offen:         matches.filter((m) => OFFEN_STATUSES.includes(m.status)).length,
    laufend:       matches.filter((m) => LAUFEND_STATUSES.includes(m.status)).length,
    abgeschlossen: matches.filter((m) => ABGESCHLOSSEN_STATUSES.includes(m.status)).length,
    alle:          matches.length,
  };

  const filtered = matches.filter((m) => {
    if (tab === "offen"         && !OFFEN_STATUSES.includes(m.status))         return false;
    if (tab === "laufend"       && !LAUFEND_STATUSES.includes(m.status))       return false;
    if (tab === "abgeschlossen" && !ABGESCHLOSSEN_STATUSES.includes(m.status)) return false;

    if (statusFilter && m.status !== statusFilter) return false;
    if (provisionFilter && m.provisionStatus !== provisionFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = [
        m.caregiverProfile.user.name,
        m.clientProfile.user.name,
        m.tenant.name,
      ].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "offen",         label: "Offen" },
    { key: "laufend",       label: "Laufend" },
    { key: "abgeschlossen", label: "Abgeschlossen" },
    { key: "alle",          label: "Alle" },
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
              placeholder="Pflegekraft, Klient oder Vermittler suchen…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-white/25"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MatchStatus | "")}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 focus:outline-none focus:border-[#C06B4A] transition-colors cursor-pointer"
          >
            <option value="" className="bg-[#2D2D2D]">Alle Status</option>
            {(Object.keys(STATUS_CONFIG) as MatchStatus[]).map((s) => (
              <option key={s} value={s} className="bg-[#2D2D2D]">{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <select
            value={provisionFilter}
            onChange={(e) => setProvisionFilter(e.target.value as ProvisionStatus | "")}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 focus:outline-none focus:border-[#C06B4A] transition-colors cursor-pointer"
          >
            <option value="" className="bg-[#2D2D2D]">Alle Provisionen</option>
            {(Object.keys(PROVISION_CONFIG) as ProvisionStatus[]).map((s) => (
              <option key={s} value={s} className="bg-[#2D2D2D]">{PROVISION_CONFIG[s].label}</option>
            ))}
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Pflegekraft</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Klient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Vermittler</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Start</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Provision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-white/25 text-sm">
                  {search || statusFilter || provisionFilter
                    ? "Keine Treffer für diese Filtereinstellungen."
                    : "Keine Matches vorhanden."}
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const statusCfg  = STATUS_CONFIG[m.status];
                const provCfg    = PROVISION_CONFIG[m.provisionStatus];
                const scoreColor = m.computedScore >= 70 ? "text-[#A8C5A8]" : m.computedScore >= 40 ? "text-amber-300" : "text-white/40";
                return (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">
                      {m.caregiverProfile.user.name ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {m.clientProfile.user.name ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                      {m.tenant.name}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`font-semibold ${scoreColor}`}>{m.computedScore}</span>
                      {m.scoreIsAuto && (
                        <span className="ml-1.5 text-[10px] text-white/30">auto</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs hidden lg:table-cell">
                      {m.startDate
                        ? format(new Date(m.startDate), "dd. MMM yyyy", { locale: de })
                        : "–"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {m.provisionAmount != null && (
                          <span className="text-white/60 text-xs">
                            {m.provisionAmount.toLocaleString("de-AT", { style: "currency", currency: "EUR" })}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${provCfg.className}`}>
                          {provCfg.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-white/30">{filtered.length} von {matches.length} Matches</p>
          {filtered.reduce((sum, m) => sum + (m.provisionAmount ?? 0), 0) > 0 && (
            <p className="text-xs text-white/50">
              Provision (gefiltert):{" "}
              <span className="font-semibold text-[#A8C5A8]">
                {filtered
                  .reduce((sum, m) => sum + (m.provisionAmount ?? 0), 0)
                  .toLocaleString("de-AT", { style: "currency", currency: "EUR" })}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
