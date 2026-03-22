"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trash2, Search, FileText, Ban, RotateCcw, ChevronDown, ChevronUp, Video } from "lucide-react";
import { updateMatchStatus, deleteMatch, confirmForClient, confirmForCaregiver } from "@/app/(dashboard)/vermittler/matches/actions";
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

const BETREUUNGSART_LABELS: Record<string, string> = {
  LIVE_IN:   "24h-Pflege",
  HOURLY:    "Stundenweise",
  PART_TIME: "Tagesbetreuung",
  FULL_TIME: "Vollzeit",
};

const PFLEGESTUFE_LABELS: Record<string, string> = {
  STUFE_1: "Stufe 1", STUFE_2: "Stufe 2", STUFE_3: "Stufe 3",
  STUFE_4: "Stufe 4", STUFE_5: "Stufe 5",
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
  caregiverProfile: CaregiverProfile & { user: Pick<User, "name" | "email"> };
  clientProfile: ClientProfile & { user: Pick<User, "name" | "email"> };
  videoMeetings?: { scheduledAt: string | Date; status: string }[];
  hasContract?: boolean;
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

function getConfirmationBadge(m: MatchWithRelations) {
  if (m.status === "ACTIVE" || m.status === "COMPLETED" || m.status === "CANCELLED") return null;
  const { caregiverConfirmed, clientConfirmed } = m;
  if (caregiverConfirmed === true && clientConfirmed === true)
    return { label: "✓ Bereit für Vertrag", className: "bg-green-50 text-green-700" };
  if (caregiverConfirmed === false || clientConfirmed === false)
    return { label: "⚠ Ablehnung", className: "bg-yellow-50 text-yellow-700" };
  const now = new Date();
  const hasPastMeeting = (m.videoMeetings ?? []).some(
    (v) => v.status !== "CANCELLED" && new Date(v.scheduledAt) < now
  );
  if (hasPastMeeting)
    return { label: "○ Wartet auf Feedback", className: "bg-gray-50 text-gray-500" };
  return null;
}

function ConfirmChip({ confirmed }: { confirmed: boolean | null }) {
  if (confirmed === true)
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#7B9E7B]/15 text-[#5A7A5A]">✓ Bestätigt</span>;
  if (confirmed === false)
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">✗ Abgelehnt</span>;
  return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2D2D2D]/6 text-[#2D2D2D]/40">○ Ausstehend</span>;
}

const OFFEN_STATUSES:         MatchStatus[] = ["PENDING"];
const LAUFEND_STATUSES:       MatchStatus[] = ["ACCEPTED", "ACTIVE"];
const ABGESCHLOSSEN_STATUSES: MatchStatus[] = ["COMPLETED", "CANCELLED"];

// ─── MatchRow ────────────────────────────────────────────────────────────────

function MatchRow({ m, initiallyExpanded }: { m: MatchWithRelations; initiallyExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded ?? false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (initiallyExpanded && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initiallyExpanded]);

  async function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Match wirklich stornieren?")) return;
    await updateMatchStatus(m.id, "CANCELLED");
  }

  async function handleReset(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Match zurück auf Ausstehend setzen?")) return;
    await updateMatchStatus(m.id, "PENDING");
  }

  async function handleConfirmForCaregiver(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Pflegekraft hat telefonisch zugestimmt – Bestätigung setzen?")) return;
    await confirmForCaregiver(m.id);
  }

  async function handleConfirmForClient(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Klient hat telefonisch zugestimmt – Bestätigung setzen?")) return;
    await confirmForClient(m.id);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Match wirklich löschen?")) return;
    const result = await deleteMatch(m.id);
    if (result?.error) alert(result.error);
  }

  const cfg = STATUS_CONFIG[m.status];
  const { score, isAuto } = getEffectiveScore(m);
  const scoreColor = score >= 70 ? "text-[#5A7A5A]" : score >= 40 ? "text-amber-600" : "text-[#2D2D2D]/40";
  const badge = getConfirmationBadge(m);
  const canCancel       = m.status === "PENDING" || m.status === "ACCEPTED";
  const canReset        = m.status === "CANCELLED";
  const canCaregiverConfirm =
    m.caregiverConfirmed === null &&
    !["ACTIVE", "COMPLETED", "CANCELLED"].includes(m.status);
  const canClientConfirm =
    m.clientConfirmed === null &&
    !["ACTIVE", "COMPLETED", "CANCELLED"].includes(m.status);

  const futureMeetings = (m.videoMeetings ?? []).filter(
    (v) => v.status !== "CANCELLED" && new Date(v.scheduledAt) > new Date()
  );
  const pastMeetings = (m.videoMeetings ?? []).filter(
    (v) => v.status !== "CANCELLED" && new Date(v.scheduledAt) <= new Date()
  );

  return (
    <>
      <tr
        ref={rowRef}
        onClick={() => setExpanded((e) => !e)}
        className="hover:bg-[#FAF6F1] transition-colors cursor-pointer"
      >
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
          <div className="flex flex-col gap-1.5 items-start">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
              {cfg.label}
            </span>
            {badge && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <MeetingScheduleButton matchId={m.id} matchStatus={m.status} />
            {m.caregiverConfirmed === true && m.clientConfirmed === true && m.status !== "ACTIVE" && (
              <Link
                href={`/vermittler/vertraege/neu/${m.id}`}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <FileText className="w-3 h-3" />
                Vertrag
              </Link>
            )}
            {canCaregiverConfirm && (
              <button
                onClick={handleConfirmForCaregiver}
                title="Pflegekraft hat telefonisch zugestimmt"
                className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#F5EDE3] text-[#C06B4A] hover:bg-[#C06B4A] hover:text-white transition-colors cursor-pointer"
              >
                P ✓
              </button>
            )}
            {canClientConfirm && (
              <button
                onClick={handleConfirmForClient}
                title="Klient hat telefonisch zugestimmt"
                className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-[#F0F7F0] text-[#5A7A5A] hover:bg-[#5A7A5A] hover:text-white transition-colors cursor-pointer"
              >
                K ✓
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                title="Match stornieren"
                className="p-1.5 text-[#2D2D2D]/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            )}
            {canReset && (
              <button
                onClick={handleReset}
                title="Zurücksetzen zu Ausstehend"
                className="p-1.5 text-[#2D2D2D]/30 hover:text-[#C06B4A] hover:bg-[#FDF5F0] rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            {m.hasContract ? (
              <span
                title="Vertrag vorhanden – nicht löschbar"
                className="p-1.5 inline-flex text-[#2D2D2D]/15 cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </span>
            ) : (
              <button
                onClick={handleDelete}
                title="Match löschen"
                className="p-1.5 text-[#2D2D2D]/30 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>
        <td className="px-4 py-3 w-8">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-[#2D2D2D]/30 ml-auto" />
            : <ChevronDown className="w-4 h-4 text-[#2D2D2D]/30 ml-auto" />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#FAF6F1]/60">
          <td colSpan={7} className="px-4 pb-5 pt-2">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pflegekraft */}
              <div className="bg-white rounded-xl border border-[#EAD9C8] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-1">Pflegekraft</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{m.caregiverProfile.user.name ?? "–"}</p>
                <p className="text-xs text-[#2D2D2D]/50">{m.caregiverProfile.user.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[#2D2D2D]/40">Bestätigung</span>
                  <ConfirmChip confirmed={m.caregiverConfirmed} />
                </div>
              </div>

              {/* Klient */}
              <div className="bg-white rounded-xl border border-[#EAD9C8] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-1">Klient</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{m.clientProfile.user.name ?? "–"}</p>
                <p className="text-xs text-[#2D2D2D]/50">{m.clientProfile.user.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[#2D2D2D]/40">Bestätigung</span>
                  <ConfirmChip confirmed={m.clientConfirmed} />
                </div>
              </div>

              {/* Pflegebedarf */}
              <div className="bg-white rounded-xl border border-[#EAD9C8] p-4 space-y-1.5">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-1">Pflegebedarf</p>
                <div className="flex gap-2">
                  <span className="text-xs text-[#2D2D2D]/40 w-24 shrink-0">Pflegestufe</span>
                  <span className="text-xs text-[#2D2D2D]/70">
                    {m.clientProfile.pflegegeldStufe
                      ? PFLEGESTUFE_LABELS[m.clientProfile.pflegegeldStufe] ?? m.clientProfile.pflegegeldStufe
                      : "–"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-[#2D2D2D]/40 w-24 shrink-0">Betreuung</span>
                  <span className="text-xs text-[#2D2D2D]/70">
                    {m.clientProfile.preferredSchedule
                      ? BETREUUNGSART_LABELS[m.clientProfile.preferredSchedule] ?? m.clientProfile.preferredSchedule
                      : "–"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-[#2D2D2D]/40 w-24 shrink-0">Sprachen</span>
                  <span className="text-xs text-[#2D2D2D]/70">
                    {m.clientProfile.preferredLanguages.length > 0
                      ? m.clientProfile.preferredLanguages.join(", ")
                      : "–"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-[#2D2D2D]/40 w-24 shrink-0">Ort</span>
                  <span className="text-xs text-[#2D2D2D]/70">
                    {[m.clientProfile.locationPostal, m.clientProfile.locationCity].filter(Boolean).join(" ") || "–"}
                  </span>
                </div>
                <div className="flex gap-2 pt-1 border-t border-[#EAD9C8] mt-1">
                  <span className="text-xs text-[#2D2D2D]/40 w-24 shrink-0">Score</span>
                  <span className={`text-xs font-semibold ${scoreColor}`}>
                    {score}{isAuto && <span className="ml-1 font-normal text-[#2D2D2D]/30">auto</span>}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-[#2D2D2D]/40 w-24 shrink-0">Erstellt</span>
                  <span className="text-xs text-[#2D2D2D]/50">
                    {format(new Date(m.createdAt), "dd.MM.yy HH:mm", { locale: de })}
                  </span>
                </div>
              </div>
            </div>

            {/* Video-Meetings */}
            {(futureMeetings.length > 0 || pastMeetings.length > 0) && (
              <div className="mt-4 bg-white rounded-xl border border-[#EAD9C8] p-4">
                <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wide mb-2">Kennenlernen</p>
                <div className="space-y-1.5">
                  {[...futureMeetings, ...pastMeetings].map((v, i) => {
                    const isPast = new Date(v.scheduledAt) <= new Date();
                    return (
                      <div key={i} className={`flex items-center gap-2 text-xs ${isPast ? "text-[#2D2D2D]/35" : "text-[#2D2D2D]/70"}`}>
                        <Video className={`w-3.5 h-3.5 shrink-0 ${isPast ? "text-[#2D2D2D]/25" : "text-[#5A7A5A]"}`} />
                        {format(new Date(v.scheduledAt), "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })}
                        {isPast && <span className="text-[10px] text-[#2D2D2D]/30">(vergangen)</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export default function MatchTable({ data }: { data: MatchWithRelations[] }) {
  const searchParams = useSearchParams();
  const openId = searchParams.get("open");
  const openMatch = openId ? data.find((m) => m.id === openId) : null;
  const [tab, setTab] = useState<Tab>(() => {
    if (!openMatch) return "offen";
    if (LAUFEND_STATUSES.includes(openMatch.status))       return "laufend";
    if (ABGESCHLOSSEN_STATUSES.includes(openMatch.status)) return "abgeschlossen";
    return "offen";
  });
  const [search, setSearch] = useState("");

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
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Aktionen</th>
              <th className="px-4 py-3 w-8" />
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
              filtered.map((m) => <MatchRow key={m.id} m={m} initiallyExpanded={m.id === openId} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
