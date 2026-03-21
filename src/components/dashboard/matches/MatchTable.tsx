"use client";

import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { updateMatchStatus, deleteMatch } from "@/app/(dashboard)/vermittler/matches/actions";
import MeetingScheduleButton from "./MeetingScheduleButton";
import type { Match, CaregiverProfile, ClientProfile, User } from "@prisma/client";
import type { MatchStatus } from "@prisma/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { computeScore } from "@/lib/scoring";

const AVAIL_REVERSE: Partial<Record<string, string>> = {
  LIVE_IN:   "24h",
  HOURLY:    "stundenweise",
  PART_TIME: "tagesbetreuung",
};

function getEffectiveScore(m: MatchWithRelations): { score: number; isAuto: boolean } {
  if (m.score != null) return { score: m.score, isAuto: false };
  const obj: Record<string, unknown> = {};
  if (m.clientProfile.preferredSchedule) {
    const b = AVAIL_REVERSE[m.clientProfile.preferredSchedule];
    if (b) obj.betreuungsart = b;
  }
  if (m.clientProfile.preferredLanguages.length > 0)
    obj.sprachen = m.clientProfile.preferredLanguages.map((lang) => ({ lang }));
  const careNeedsRaw = Object.keys(obj).length > 0 ? JSON.stringify(obj) : null;
  const result = computeScore(m.caregiverProfile, {
    pflegegeldStufe: m.clientProfile.pflegegeldStufe ?? null,
    careNeedsRaw,
  });
  return { score: result.score, isAuto: true };
}

type MatchWithRelations = Match & {
  caregiverProfile: CaregiverProfile & { user: Pick<User, "name"> };
  clientProfile: ClientProfile & { user: Pick<User, "name"> };
};

type Tab = "offen" | "laufend" | "abgeschlossen" | "alle";

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  PROPOSED:  { label: "Vorgeschlagen", className: "bg-[#F5EDE3] text-[#C06B4A]" },
  PENDING:   { label: "Ausstehend",    className: "bg-amber-50 text-amber-700" },
  ACCEPTED:  { label: "Akzeptiert",    className: "bg-[#F0F7F0] text-[#5A7A5A]" },
  ACTIVE:    { label: "Aktiv",         className: "bg-[#7B9E7B]/15 text-[#5A7A5A] font-semibold" },
  COMPLETED: { label: "Abgeschlossen", className: "bg-[#EAD9C8] text-[#2D2D2D]/50" },
  CANCELLED: { label: "Storniert",     className: "bg-red-50 text-red-600" },
};

const ALL_STATUSES: MatchStatus[] = ["PENDING", "ACCEPTED", "ACTIVE", "COMPLETED", "CANCELLED"];

const OFFEN_STATUSES:        MatchStatus[] = ["PENDING"];
const LAUFEND_STATUSES:      MatchStatus[] = ["ACCEPTED", "ACTIVE"];
const ABGESCHLOSSEN_STATUSES: MatchStatus[] = ["COMPLETED", "CANCELLED"];

export default function MatchTable({ data }: { data: MatchWithRelations[] }) {
  const [tab, setTab]       = useState<Tab>("offen");
  const [search, setSearch] = useState("");

  async function handleStatusChange(matchId: string, status: MatchStatus) {
    await updateMatchStatus(matchId, status);
  }

  async function handleDelete(matchId: string) {
    if (!confirm("Match wirklich löschen?")) return;
    await deleteMatch(matchId);
  }

  const counts = {
    offen:         data.filter((m) => OFFEN_STATUSES.includes(m.status)).length,
    laufend:       data.filter((m) => LAUFEND_STATUSES.includes(m.status)).length,
    abgeschlossen: data.filter((m) => ABGESCHLOSSEN_STATUSES.includes(m.status)).length,
    alle:          data.length,
  };

  const filtered = data.filter((m) => {
    if (tab === "offen"         && !OFFEN_STATUSES.includes(m.status))         return false;
    if (tab === "laufend"       && !LAUFEND_STATUSES.includes(m.status))       return false;
    if (tab === "abgeschlossen" && !ABGESCHLOSSEN_STATUSES.includes(m.status)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = [
        m.caregiverProfile.user.name,
        m.clientProfile.user.name,
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
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 pt-4 pb-3 border-b border-[#EAD9C8] space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pflegekraft oder Klient suchen…"
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Pflegekraft</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Klient</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Start</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[#2D2D2D]/35 text-sm">
                  {search ? "Keine Treffer für diese Suche." : "Keine Matches vorhanden."}
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const cfg = STATUS_CONFIG[m.status];
                const { score, isAuto } = getEffectiveScore(m);
                const scoreColor = score >= 70 ? "text-[#5A7A5A]" : score >= 40 ? "text-amber-600" : "text-[#2D2D2D]/40";
                return (
                  <tr key={m.id} className="hover:bg-[#FAF6F1] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#2D2D2D]">
                      {m.caregiverProfile.user.name ?? "–"}
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70">
                      {m.clientProfile.user.name ?? "–"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`font-semibold ${scoreColor}`}>{score}</span>
                      {isAuto && <span className="ml-1 text-[10px] text-[#2D2D2D]/30">auto</span>}
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
                      <MeetingScheduleButton matchId={m.id} matchStatus={m.status} />
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
