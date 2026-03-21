"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { ContractStatus } from "@prisma/client";

const STATUS_CONFIG: Record<ContractStatus, { label: string; className: string }> = {
  ACTIVE:     { label: "Aktiv",      className: "bg-green-50 text-green-700" },
  TERMINATED: { label: "Gekündigt",  className: "bg-red-50 text-red-600" },
  EXPIRED:    { label: "Abgelaufen", className: "bg-gray-50 text-gray-500" },
};

type ContractRow = {
  id: string;
  status: ContractStatus;
  contractNumber: string | null;
  startDate: Date;
  matchFeeAmount: number | null;
  monthlyFeeAmount: number | null;
  caregiverName: string;
  clientName: string;
};

type Tab = "aktiv" | "beendet" | "alle";

const AKTIV_STATUSES:   ContractStatus[] = ["ACTIVE"];
const BEENDET_STATUSES: ContractStatus[] = ["TERMINATED", "EXPIRED"];

export default function VertraegeTable({ data }: { data: ContractRow[] }) {
  const [tab, setTab]       = useState<Tab>("aktiv");
  const [search, setSearch] = useState("");

  const counts = {
    aktiv:   data.filter((c) => AKTIV_STATUSES.includes(c.status)).length,
    beendet: data.filter((c) => BEENDET_STATUSES.includes(c.status)).length,
    alle:    data.length,
  };

  const filtered = data.filter((c) => {
    if (tab === "aktiv"   && !AKTIV_STATUSES.includes(c.status))   return false;
    if (tab === "beendet" && !BEENDET_STATUSES.includes(c.status)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = [c.caregiverName, c.clientName, c.contractNumber ?? ""].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "aktiv",   label: "Aktiv" },
    { key: "beendet", label: "Beendet" },
    { key: "alle",    label: "Alle" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 pt-4 pb-3 border-b border-[#EAD9C8] space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pflegekraft, Klient oder Ref.-Nr. suchen…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-[#2D2D2D]/35"
          />
        </div>
        <div className="flex gap-1">
          {tabs.map(({ key, label }) => (
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
            <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden sm:table-cell">Nr.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Pflegekraft</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Klient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Start</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Matchgebühr</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Monatspauschale</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[#2D2D2D]/35 text-sm">
                  {search ? "Keine Treffer für diese Suche." : "Keine Verträge vorhanden."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <tr key={c.id} className="hover:bg-[#FAF6F1] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#2D2D2D]/50 hidden sm:table-cell">
                      {c.contractNumber ?? `…${c.id.slice(-6)}`}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2D2D2D]">{c.caregiverName}</td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70">{c.clientName}</td>
                    <td className="px-4 py-3 text-[#2D2D2D]/60 text-xs hidden md:table-cell">
                      {format(new Date(c.startDate), "dd. MMM yyyy", { locale: de })}
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70 hidden lg:table-cell">
                      {c.matchFeeAmount != null ? `€${c.matchFeeAmount.toFixed(2)}` : "–"}
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70 hidden lg:table-cell">
                      {c.monthlyFeeAmount != null ? `€${c.monthlyFeeAmount.toFixed(2)}` : "–"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/vermittler/vertraege/${c.id}`}
                        className="text-xs text-[#C06B4A] hover:underline font-medium"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
