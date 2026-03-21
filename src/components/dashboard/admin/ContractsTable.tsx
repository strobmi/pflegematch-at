"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Search } from "lucide-react";

type ContractStatus = "ACTIVE" | "TERMINATED" | "EXPIRED";

export interface ContractRow {
  id: string;
  status: ContractStatus;
  startDate: string;
  matchFeeAmount: number | null;
  monthlyFeeAmount: number | null;
  tenant: { name: string };
  caregiverProfile: { user: { name: string | null; email: string } };
  clientProfile: { user: { name: string | null; email: string } };
}

const STATUS_CONFIG: Record<ContractStatus, { label: string; cls: string }> = {
  ACTIVE:     { label: "Aktiv",      cls: "bg-[#7B9E7B]/30 text-[#A8C5A8]" },
  TERMINATED: { label: "Gekündigt",  cls: "bg-red-500/20 text-red-400" },
  EXPIRED:    { label: "Abgelaufen", cls: "bg-white/10 text-white/50" },
};

export default function ContractsTable({ contracts }: { contracts: ContractRow[] }) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState<ContractStatus | "">("");
  const [tenantFilter, setTenant] = useState("");

  const tenantNames = Array.from(new Set(contracts.map((c) => c.tenant.name))).sort();

  const filtered = contracts.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (tenantFilter && c.tenant.name !== tenantFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = [
        c.caregiverProfile.user.name,
        c.caregiverProfile.user.email,
        c.clientProfile.user.name,
        c.clientProfile.user.email,
        c.tenant.name,
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header + toolbar */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 space-y-3">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Alle Verträge</p>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pflegekraft oder Klient suchen…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-white/25"
            />
          </div>
          {tenantNames.length > 1 && (
            <select
              value={tenantFilter}
              onChange={(e) => setTenant(e.target.value)}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 focus:outline-none focus:border-[#C06B4A] transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#2D2D2D]">Alle Tenants</option>
              {tenantNames.map((n) => (
                <option key={n} value={n} className="bg-[#2D2D2D]">{n}</option>
              ))}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as ContractStatus | "")}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 focus:outline-none focus:border-[#C06B4A] transition-colors cursor-pointer"
          >
            <option value="" className="bg-[#2D2D2D]">Alle Status</option>
            {(Object.keys(STATUS_CONFIG) as ContractStatus[]).map((s) => (
              <option key={s} value={s} className="bg-[#2D2D2D]">{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {contracts.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-white/30">Noch keine Verträge.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Pflegekraft</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Klient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Start</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Matchgeb.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Monatspausch.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-white/30">
                      Keine Treffer für diese Filtereinstellungen.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const cfg = STATUS_CONFIG[c.status];
                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white/50 text-xs">{c.tenant.name}</td>
                        <td className="px-4 py-3 font-medium text-white">
                          {c.caregiverProfile.user.name ?? c.caregiverProfile.user.email}
                        </td>
                        <td className="px-4 py-3 text-white/70 hidden lg:table-cell">
                          {c.clientProfile.user.name ?? c.clientProfile.user.email}
                        </td>
                        <td className="px-4 py-3 text-white/50 text-xs hidden md:table-cell">
                          {format(new Date(c.startDate), "dd. MMM yyyy", { locale: de })}
                        </td>
                        <td className="px-4 py-3 text-right text-white/60">
                          {c.matchFeeAmount != null ? `€${c.matchFeeAmount.toFixed(2)}` : "–"}
                        </td>
                        <td className="px-4 py-3 text-right text-[#C06B4A] font-medium">
                          {c.monthlyFeeAmount != null ? `€${c.monthlyFeeAmount.toFixed(2)}` : "–"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-xs text-white/30">{filtered.length} von {contracts.length} Verträgen</p>
          </div>
        </>
      )}
    </div>
  );
}
