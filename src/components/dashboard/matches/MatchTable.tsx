"use client";

import { Trash2 } from "lucide-react";
import { updateMatchStatus, deleteMatch } from "@/app/(dashboard)/vermittler/matches/actions";
import type { Match, CaregiverProfile, ClientProfile, User } from "@prisma/client";
import type { MatchStatus } from "@prisma/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type MatchWithRelations = Match & {
  caregiverProfile: CaregiverProfile & { user: Pick<User, "name"> };
  clientProfile: ClientProfile & { user: Pick<User, "name"> };
};

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  PROPOSED:  { label: "Vorgeschlagen", className: "bg-[#F5EDE3] text-[#C06B4A]" },
  PENDING:   { label: "Ausstehend",    className: "bg-amber-50 text-amber-700" },
  ACCEPTED:  { label: "Akzeptiert",    className: "bg-[#F0F7F0] text-[#5A7A5A]" },
  ACTIVE:    { label: "Aktiv",         className: "bg-[#7B9E7B]/15 text-[#5A7A5A] font-semibold" },
  COMPLETED: { label: "Abgeschlossen", className: "bg-[#EAD9C8] text-[#2D2D2D]/50" },
  CANCELLED: { label: "Storniert",     className: "bg-red-50 text-red-600" },
};

const ALL_STATUSES: MatchStatus[] = ["PROPOSED","PENDING","ACCEPTED","ACTIVE","COMPLETED","CANCELLED"];

export default function MatchTable({ data }: { data: MatchWithRelations[] }) {
  async function handleStatusChange(matchId: string, status: MatchStatus) {
    await updateMatchStatus(matchId, status);
  }

  async function handleDelete(matchId: string) {
    if (!confirm("Match wirklich löschen?")) return;
    await deleteMatch(matchId);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Pflegekraft</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Klient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Start</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {data.map((m) => {
              const cfg = STATUS_CONFIG[m.status];
              return (
                <tr key={m.id} className="hover:bg-[#FAF6F1] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#2D2D2D]">
                    {m.caregiverProfile.user.name ?? "–"}
                  </td>
                  <td className="px-4 py-3 text-[#2D2D2D]/70">
                    {m.clientProfile.user.name ?? "–"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {m.score != null ? (
                      <span className="text-[#7B9E7B] font-semibold">{m.score}%</span>
                    ) : "–"}
                  </td>
                  <td className="px-4 py-3 text-[#2D2D2D]/60 text-xs hidden lg:table-cell">
                    {m.startDate
                      ? format(new Date(m.startDate), "dd. MMM yyyy", { locale: de })
                      : "–"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue={m.status}
                      onChange={(e) => handleStatusChange(m.id, e.target.value as MatchStatus)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${cfg.className}`}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-[#2D2D2D]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
