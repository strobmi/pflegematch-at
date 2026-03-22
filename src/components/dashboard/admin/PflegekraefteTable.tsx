"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface Caregiver {
  id:           string;
  userId:       string;
  type:         string;
  isActive:     boolean;
  availability: string;
  locationCity: string | null;
  matchCount:   number;
  user:   { id: string; name: string | null; email: string };
  tenant: { id: string; name: string; isPlatform: boolean };
}

interface TenantOption {
  id:   string;
  name: string;
}

interface Props {
  caregivers:      Caregiver[];
  allTenants:      TenantOption[];
  platformTenantId: string;
  onAssign:   (pflegerUserId: string, targetTenantId: string) => Promise<{ error?: string }>;
  onUnassign: (pflegerUserId: string, currentTenantId: string) => Promise<{ error?: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  FREELANCE: "Freelance",
  EMPLOYED:  "Angestellt",
};

const AVAIL_LABELS: Record<string, string> = {
  FULL_TIME: "Vollzeit",
  PART_TIME: "Teilzeit",
  HOURLY:    "Stündlich",
  LIVE_IN:   "Live-in",
};

export default function PflegekraefteTable({
  caregivers: initial,
  allTenants,
  platformTenantId,
  onAssign,
  onUnassign,
}: Props) {
  const [caregivers, setCaregivers] = useState(initial);
  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterTenant, setFilterTenant] = useState<string>("ALL");
  const [error,      setError]      = useState<string | null>(null);
  const [isPending,  startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    return caregivers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.user.name?.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q) ||
        c.locationCity?.toLowerCase().includes(q);
      const matchesType   = filterType === "ALL"   || c.type === filterType;
      const matchesTenant =
        filterTenant === "ALL"      ? true :
        filterTenant === "PLATFORM" ? c.tenant.isPlatform :
                                      c.tenant.id === filterTenant;
      return matchesSearch && matchesType && matchesTenant;
    });
  }, [caregivers, search, filterType, filterTenant]);

  function handleAssignChange(caregiver: Caregiver, newTenantId: string) {
    setError(null);
    startTransition(async () => {
      let res: { error?: string };
      if (newTenantId === platformTenantId) {
        res = await onUnassign(caregiver.userId, caregiver.tenant.id);
      } else {
        res = await onAssign(caregiver.userId, newTenantId);
      }
      if (res.error) { setError(res.error); return; }

      const newTenant =
        newTenantId === platformTenantId
          ? { id: platformTenantId, name: "Plattform", isPlatform: true }
          : { id: newTenantId, name: allTenants.find((t) => t.id === newTenantId)?.name ?? "", isPlatform: false };

      setCaregivers((prev) =>
        prev.map((c) => c.id === caregiver.id ? { ...c, tenant: newTenant } : c)
      );
      router.refresh();
    });
  }

  const inputClass =
    "px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#C06B4A] focus:ring-1 focus:ring-[#C06B4A]/20 placeholder:text-white/30 transition-colors";

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-xl">{error}</p>
      )}

      {/* Filter-Leiste */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Name, E-Mail oder Stadt…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass + " w-full pl-9"}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={inputClass + " cursor-pointer"}
        >
          <option value="ALL"       className="bg-[#2D2D2D]">Alle Typen</option>
          <option value="EMPLOYED"  className="bg-[#2D2D2D]">Angestellt</option>
          <option value="FREELANCE" className="bg-[#2D2D2D]">Freelance</option>
        </select>
        <select
          value={filterTenant}
          onChange={(e) => setFilterTenant(e.target.value)}
          className={inputClass + " cursor-pointer"}
        >
          <option value="ALL"      className="bg-[#2D2D2D]">Alle Vermittler</option>
          <option value="PLATFORM" className="bg-[#2D2D2D]">Plattform (keine Zuordnung)</option>
          {allTenants.map((t) => (
            <option key={t.id} value={t.id} className="bg-[#2D2D2D]">{t.name}</option>
          ))}
        </select>
      </div>

      {/* Tabelle */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Typ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Verfügbarkeit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Ort</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Matches</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Vermittler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/30 text-sm">
                  Keine Pflegekräfte gefunden.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{c.user.name ?? "–"}</p>
                  <p className="text-xs text-white/40">{c.user.email}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    c.type === "FREELANCE"
                      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                  }`}>
                    {TYPE_LABELS[c.type] ?? c.type}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-white/60 text-xs">
                  {AVAIL_LABELS[c.availability] ?? c.availability}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {c.locationCity ? (
                    <span className="flex items-center gap-1 text-xs text-white/50">
                      <MapPin className="w-3 h-3" />{c.locationCity}
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">–</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-white/60 text-xs">
                  {c.matchCount}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={c.tenant.isPlatform ? platformTenantId : c.tenant.id}
                    onChange={(e) => handleAssignChange(c, e.target.value)}
                    disabled={isPending}
                    className="text-xs bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C06B4A] disabled:opacity-50 cursor-pointer max-w-[160px]"
                  >
                    <option value={platformTenantId} className="bg-[#2D2D2D]">— Plattform —</option>
                    {allTenants.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#2D2D2D]">{t.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/30 text-right">{filtered.length} von {caregivers.length} Einträgen</p>
    </div>
  );
}
