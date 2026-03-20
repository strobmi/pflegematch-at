"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, ArchiveX, ArchiveRestore, Search } from "lucide-react";
import { setKlientActive } from "@/app/(dashboard)/vermittler/klienten/actions";
import type { ClientProfile, User } from "@prisma/client";

type KlientWithUser = ClientProfile & { user: Pick<User, "id" | "name" | "email"> };
type Tab = "aktiv" | "inaktiv" | "alle";

const STUFE_LABELS: Record<string, string> = {
  STUFE_1: "Stufe 1", STUFE_2: "Stufe 2", STUFE_3: "Stufe 3",
  STUFE_4: "Stufe 4", STUFE_5: "Stufe 5",
};

export default function KlientenTable({ data }: { data: KlientWithUser[] }) {
  const [tab, setTab]               = useState<Tab>("aktiv");
  const [search, setSearch]         = useState("");
  const [stufeFilter, setStufeFilter] = useState("");

  async function handleToggleActive(id: string, currentlyActive: boolean) {
    const msg = currentlyActive ? "Klient archivieren?" : "Klient reaktivieren?";
    if (!confirm(msg)) return;
    await setKlientActive(id, !currentlyActive);
  }

  const counts = {
    aktiv:   data.filter((k) =>  k.isActive).length,
    inaktiv: data.filter((k) => !k.isActive).length,
    alle:    data.length,
  };

  const filtered = data.filter((k) => {
    if (tab === "aktiv"   && !k.isActive) return false;
    if (tab === "inaktiv" &&  k.isActive) return false;
    if (stufeFilter && k.pflegegeldStufe !== stufeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = [k.user.name, k.user.email, k.locationCity].join(" ").toLowerCase();
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
            value={stufeFilter}
            onChange={(e) => setStufeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors text-[#2D2D2D]/70 cursor-pointer"
          >
            <option value="">Alle Pflegestufen</option>
            <option value="STUFE_1">Stufe 1</option>
            <option value="STUFE_2">Stufe 2</option>
            <option value="STUFE_3">Stufe 3</option>
            <option value="STUFE_4">Stufe 4</option>
            <option value="STUFE_5">Stufe 5</option>
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Pflegegeld</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Benötigte Skills</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#2D2D2D]/35 text-sm">
                  {search || stufeFilter ? "Keine Treffer für diese Filtereinstellungen." : "Keine Klienten vorhanden."}
                </td>
              </tr>
            ) : (
              filtered.map((k) => (
                <tr key={k.id} className="hover:bg-[#FAF6F1] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#2D2D2D]">{k.user.name}</div>
                    <div className="text-xs text-[#2D2D2D]/45">{k.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#2D2D2D]/70 hidden md:table-cell">
                    {k.locationCity ?? "–"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {k.pflegegeldStufe ? (
                      <span className="bg-[#F5EDE3] text-[#C06B4A] text-xs font-medium px-2 py-0.5 rounded-full">
                        {STUFE_LABELS[k.pflegegeldStufe]}
                      </span>
                    ) : "–"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {k.requiredSkills.slice(0, 2).map((s) => (
                        <span key={s} className="bg-[#F0F7F0] text-[#5A7A5A] text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {k.requiredSkills.length > 2 && (
                        <span className="text-xs text-[#2D2D2D]/40">+{k.requiredSkills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${k.isActive ? "text-[#5A7A5A]" : "text-[#2D2D2D]/40"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${k.isActive ? "bg-[#7B9E7B]" : "bg-[#D4B896]"}`} />
                      {k.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/vermittler/klienten/${k.id}/bearbeiten`}
                        className="p-1.5 text-[#2D2D2D]/40 hover:text-[#C06B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleToggleActive(k.id, k.isActive)}
                        title={k.isActive ? "Archivieren" : "Reaktivieren"}
                        className={`p-1.5 rounded-lg transition-colors ${k.isActive ? "text-[#2D2D2D]/40 hover:text-amber-600 hover:bg-amber-50" : "text-[#2D2D2D]/40 hover:text-[#5A7A5A] hover:bg-[#F0F7F0]"}`}
                      >
                        {k.isActive ? <ArchiveX className="w-3.5 h-3.5" /> : <ArchiveRestore className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
