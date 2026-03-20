"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search } from "lucide-react";
import { deletePfleger } from "@/app/(dashboard)/vermittler/pfleger/actions";
import type { CaregiverProfile, User } from "@prisma/client";

type PflegerWithUser = CaregiverProfile & { user: Pick<User, "id" | "name" | "email"> };
type Tab = "aktiv" | "inaktiv" | "alle";

const AVAILABILITY_LABELS: Record<string, string> = {
  FULL_TIME: "Vollzeit",
  PART_TIME: "Teilzeit",
  HOURLY:    "Stundenweise",
  LIVE_IN:   "24h",
};

const AVAIL_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  AVAILABLE:     { label: "Verfügbar",       className: "bg-[#EAF3EA] text-[#5A7A5A] border-[#C2D9C2]" },
  ON_ASSIGNMENT: { label: "Im Einsatz",      className: "bg-[#F5EDE3] text-[#C06B4A] border-[#E8C9B0]" },
  VACATION:      { label: "Urlaub",          className: "bg-blue-50 text-blue-600 border-blue-200" },
  BLOCKED:       { label: "Nicht verfügbar", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

interface Props {
  data: PflegerWithUser[];
  matchInfo: Record<string, { active: number; pending: number }>;
  availInfo: Record<string, string>;
}

export default function PflegerTable({ data, matchInfo, availInfo }: Props) {
  const [tab, setTab]               = useState<Tab>("aktiv");
  const [search, setSearch]         = useState("");
  const [verfFilter, setVerfFilter] = useState("");

  async function handleDelete(id: string) {
    if (!confirm("Pflegekraft wirklich löschen?")) return;
    await deletePfleger(id);
  }

  const counts = {
    aktiv:   data.filter((p) =>  p.isActive).length,
    inaktiv: data.filter((p) => !p.isActive).length,
    alle:    data.length,
  };

  const filtered = data.filter((p) => {
    if (tab === "aktiv"   && !p.isActive) return false;
    if (tab === "inaktiv" &&  p.isActive) return false;
    if (verfFilter && p.availability !== verfFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = [p.user.name, p.user.email, p.locationCity].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "aktiv",   label: "Aktiv" },
    { key: "inaktiv", label: "Inaktiv" },
    { key: "alle",    label: "Alle" },
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
              placeholder="Name, E-Mail oder Stadt suchen…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-[#2D2D2D]/35"
            />
          </div>
          <select
            value={verfFilter}
            onChange={(e) => setVerfFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors text-[#2D2D2D]/70 cursor-pointer"
          >
            <option value="">Alle Verfügbarkeiten</option>
            <option value="FULL_TIME">Vollzeit</option>
            <option value="PART_TIME">Teilzeit</option>
            <option value="HOURLY">Stundenweise</option>
            <option value="LIVE_IN">24h</option>
          </select>
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Stadt</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Verfügbarkeit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Skills</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden xl:table-cell">Auslastung</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden xl:table-cell">Planung</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[#2D2D2D]/35 text-sm">
                  {search || verfFilter ? "Keine Treffer für diese Filtereinstellungen." : "Keine Pflegekräfte vorhanden."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const mi = matchInfo[p.id];
                const avStatus = availInfo[p.id];
                const avCfg = avStatus ? AVAIL_STATUS_CONFIG[avStatus] : null;
                return (
                  <tr key={p.id} className="hover:bg-[#FAF6F1] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#2D2D2D]">{p.user.name}</div>
                      <div className="text-xs text-[#2D2D2D]/45">{p.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70 hidden md:table-cell">
                      {p.locationCity ?? "–"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="bg-[#F5EDE3] text-[#C06B4A] text-xs font-medium px-2 py-0.5 rounded-full">
                        {AVAILABILITY_LABELS[p.availability] ?? p.availability}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.skills.slice(0, 2).map((s) => (
                          <span key={s} className="bg-[#F0F7F0] text-[#5A7A5A] text-xs px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                        {p.skills.length > 2 && (
                          <span className="text-xs text-[#2D2D2D]/40">+{p.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    {/* Auslastung */}
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {mi && (mi.active > 0 || mi.pending > 0) ? (
                        <div className="flex flex-col gap-0.5">
                          {mi.active > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5A7A5A]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7B9E7B]" />
                              {mi.active} aktiv
                            </span>
                          )}
                          {mi.pending > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-[#2D2D2D]/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4B896]" />
                              {mi.pending} offen
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#2D2D2D]/30">–</span>
                      )}
                    </td>
                    {/* Planung (Kalender-Verfügbarkeit) */}
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {avCfg ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${avCfg.className}`}>
                          {avCfg.label}
                        </span>
                      ) : (
                        <span className="text-xs text-[#2D2D2D]/30">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        p.isActive ? "text-[#5A7A5A]" : "text-[#2D2D2D]/40"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-[#7B9E7B]" : "bg-[#D4B896]"}`} />
                        {p.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/vermittler/pfleger/${p.id}/bearbeiten`}
                          className="p-1.5 text-[#2D2D2D]/40 hover:text-[#C06B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-[#2D2D2D]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
