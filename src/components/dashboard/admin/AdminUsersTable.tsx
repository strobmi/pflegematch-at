"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  SUPERADMIN:       { label: "Superadmin", className: "bg-[#C06B4A]/30 text-[#E09070]" },
  VERMITTLER_ADMIN: { label: "Vermittler", className: "bg-[#7B9E7B]/30 text-[#A8C5A8]" },
  PFLEGER:          { label: "Pfleger",    className: "bg-blue-500/20 text-blue-300" },
  KUNDE:            { label: "Kunde",      className: "bg-purple-500/20 text-purple-300" },
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean | null;
  tenant: string | null;
};

type Tab = "alle" | "aktiv" | "archiviert";

export default function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tab, setTab]           = useState<Tab>("alle");

  const filtered = users.filter((u) => {
    if (tab === "aktiv"      &&  u.isActive === false) return false;
    if (tab === "archiviert" &&  u.isActive !== false) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (![u.name, u.email, u.tenant].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    alle:       users.length,
    aktiv:      users.filter((u) => u.isActive !== false).length,
    archiviert: users.filter((u) => u.isActive === false).length,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "alle",       label: "Alle" },
    { key: "aktiv",      label: "Aktiv" },
    { key: "archiviert", label: "Archiviert" },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, E-Mail oder Herkunft suchen…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/70 focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
          >
            <option value="">Alle Rollen</option>
            <option value="PFLEGER">Pfleger</option>
            <option value="KUNDE">Kunde</option>
            <option value="VERMITTLER_ADMIN">Vermittler</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>
        </div>
        <div className="flex gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                tab === key ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">E-Mail</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Typ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Herkunft</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden xl:table-cell">Letzter Login</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden xl:table-cell">Registriert</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/30">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {search || roleFilter ? "Keine Treffer für diese Filtereinstellungen." : "Keine User vorhanden."}
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const cfg = ROLE_CONFIG[u.role] ?? { label: u.role, className: "bg-white/10 text-white/50" };
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{u.name ?? "–"}</td>
                    <td className="px-4 py-3 text-white/50 hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.isActive === false ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Archiviert</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">Aktiv</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/50 hidden lg:table-cell">{u.tenant ?? "–"}</td>
                    <td className="px-4 py-3 text-white/40 text-xs hidden xl:table-cell">{u.lastLoginAt ?? "–"}</td>
                    <td className="px-4 py-3 text-white/40 text-xs hidden xl:table-cell">{u.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}/bearbeiten`}
                        className="text-xs text-white/40 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Bearbeiten
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
