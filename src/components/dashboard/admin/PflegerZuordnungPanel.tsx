"use client";

import { useState, useTransition } from "react";
import { UserMinus, UserPlus, Search } from "lucide-react";

interface PflegerEntry {
  id: string;
  userId: string;
  type: string;
  user: { id: string; name: string | null; email: string };
}

interface Props {
  tenantId: string;
  tenantName: string;
  assigned: PflegerEntry[];
  unassigned: PflegerEntry[];
  onAssign: (pflegerUserId: string, targetTenantId: string) => Promise<{ error?: string }>;
  onUnassign: (pflegerUserId: string, currentTenantId: string) => Promise<{ error?: string }>;
}

export default function PflegerZuordnungPanel({
  tenantId,
  tenantName,
  assigned: initialAssigned,
  unassigned: initialUnassigned,
  onAssign,
  onUnassign,
}: Props) {
  const [assigned, setAssigned] = useState(initialAssigned);
  const [unassigned, setUnassigned] = useState(initialUnassigned);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredUnassigned = unassigned.filter(
    (p) =>
      p.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleAssign(pfleger: PflegerEntry) {
    setError(null);
    startTransition(async () => {
      const res = await onAssign(pfleger.userId, tenantId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setAssigned((prev) => [...prev, pfleger]);
      setUnassigned((prev) => prev.filter((p) => p.id !== pfleger.id));
    });
  }

  function handleUnassign(pfleger: PflegerEntry) {
    setError(null);
    startTransition(async () => {
      const res = await onUnassign(pfleger.userId, tenantId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setUnassigned((prev) => [...prev, pfleger]);
      setAssigned((prev) => prev.filter((p) => p.id !== pfleger.id));
    });
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-white/30 placeholder:text-white/30";

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Assigned Pflegekräfte */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">
            Zugeordnet zu {tenantName}
            <span className="ml-2 text-sm font-normal text-white/40">({assigned.length})</span>
          </h2>
        </div>

        {assigned.length === 0 ? (
          <p className="text-sm text-white/40 py-4 text-center">
            Noch keine Pflegekräfte zugeordnet.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {assigned.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {p.user.name ?? "–"}
                  </p>
                  <p className="text-xs text-white/40 truncate">{p.user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      p.type === "FREELANCE"
                        ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                        : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                    }`}
                  >
                    {p.type === "FREELANCE" ? "Freelance" : "Angestellt"}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleUnassign(p)}
                    title="Zurück zu Platform"
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Unassigned Pflegekräfte (Platform) */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">
            Verfügbare Plattform-Pflegekräfte
            <span className="ml-2 text-sm font-normal text-white/40">({unassigned.length})</span>
          </h2>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Name oder E-Mail suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </div>

        {filteredUnassigned.length === 0 ? (
          <p className="text-sm text-white/40 py-4 text-center">
            {unassigned.length === 0
              ? "Keine Pflegekräfte auf der Plattform verfügbar."
              : "Keine Treffer für diese Suche."}
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {filteredUnassigned.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {p.user.name ?? "–"}
                  </p>
                  <p className="text-xs text-white/40 truncate">{p.user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      p.type === "FREELANCE"
                        ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                        : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                    }`}
                  >
                    {p.type === "FREELANCE" ? "Freelance" : "Angestellt"}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAssign(p)}
                    title="Dem Vermittler zuordnen"
                    className="p-1.5 rounded-lg text-white/40 hover:text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-40"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
