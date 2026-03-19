import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link2 } from "lucide-react";
import type { MatchStatus, ProvisionStatus } from "@prisma/client";
import { computeScore } from "@/lib/scoring";

const AVAIL_REVERSE: Partial<Record<string, string>> = {
  LIVE_IN:   "24h",
  HOURLY:    "stundenweise",
  PART_TIME: "tagesbetreuung",
};

export const metadata = { title: "Matches · Admin · pflegematch" };

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  PROPOSED:  { label: "Vorgeschlagen", className: "bg-[#C06B4A]/20 text-[#C06B4A]" },
  PENDING:   { label: "Ausstehend",    className: "bg-amber-500/20 text-amber-300" },
  ACCEPTED:  { label: "Akzeptiert",    className: "bg-[#7B9E7B]/20 text-[#A8C5A8]" },
  ACTIVE:    { label: "Aktiv",         className: "bg-[#7B9E7B]/30 text-[#A8C5A8] font-semibold" },
  COMPLETED: { label: "Abgeschlossen", className: "bg-white/10 text-white/50" },
  CANCELLED: { label: "Storniert",     className: "bg-red-500/20 text-red-400" },
};

const PROVISION_CONFIG: Record<ProvisionStatus, { label: string; className: string }> = {
  PENDING:  { label: "Offen",      className: "bg-amber-500/20 text-amber-300" },
  INVOICED: { label: "Verrechnet", className: "bg-[#C06B4A]/20 text-[#C06B4A]" },
  PAID:     { label: "Bezahlt",    className: "bg-[#7B9E7B]/30 text-[#A8C5A8]" },
};

export default async function AdminMatchesPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const matches = await prisma.match.findMany({
    where: { tenant: { isPlatform: false } },
    include: {
      tenant: { select: { name: true } },
      caregiverProfile: {
        select: {
          user: { select: { name: true } },
          pflegestufe: true,
          languages: true,
          availability: true,
          averageRating: true,
        },
      },
      clientProfile: {
        select: {
          user: { select: { name: true } },
          pflegegeldStufe: true,
          preferredLanguages: true,
          preferredSchedule: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute score where not stored: use saved value first, fall back to computeScore
  const matchesWithScore = matches.map((m) => {
    if (m.score != null) return { ...m, computedScore: m.score, scoreIsAuto: false };
    const careNeedsRaw = (() => {
      const obj: Record<string, unknown> = {};
      if (m.clientProfile.preferredSchedule) {
        const b = AVAIL_REVERSE[m.clientProfile.preferredSchedule];
        if (b) obj.betreuungsart = b;
      }
      if (m.clientProfile.preferredLanguages.length > 0)
        obj.sprachen = m.clientProfile.preferredLanguages.map((lang) => ({ lang }));
      return Object.keys(obj).length > 0 ? JSON.stringify(obj) : null;
    })();
    const result = computeScore(m.caregiverProfile, {
      pflegegeldStufe: m.clientProfile.pflegegeldStufe ?? null,
      careNeedsRaw,
    });
    return { ...m, computedScore: result.score, scoreIsAuto: true };
  });

  const activeCount    = matches.filter((m) => m.status === "ACTIVE").length;
  const provisionTotal = matches.reduce((sum, m) => sum + Number(m.provisionAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alle Matches</h1>
          <p className="text-sm text-white/50 mt-0.5">
            {matches.length} gesamt · {activeCount} aktiv
          </p>
        </div>
        {provisionTotal > 0 && (
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase tracking-wide">Provision gesamt</p>
            <p className="text-xl font-bold text-[#A8C5A8]">
              {provisionTotal.toLocaleString("de-AT", { style: "currency", currency: "EUR" })}
            </p>
          </div>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Link2 className="w-10 h-10 mx-auto mb-3 text-white/20" />
          <p className="text-white/30">Noch keine Matches vorhanden.</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Pflegekraft</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Klient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Vermittler</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Start</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Provision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {matchesWithScore.map((m) => {
                  const statusCfg    = STATUS_CONFIG[m.status];
                  const provCfg      = PROVISION_CONFIG[m.provisionStatus];
                  const scoreColor   = m.computedScore >= 70 ? "text-[#A8C5A8]" : m.computedScore >= 40 ? "text-amber-300" : "text-white/40";
                  return (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        {m.caregiverProfile.user.name ?? "–"}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {m.clientProfile.user.name ?? "–"}
                      </td>
                      <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                        {m.tenant.name}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`font-semibold ${scoreColor}`}>{m.computedScore}</span>
                        {m.scoreIsAuto && (
                          <span className="ml-1.5 text-[10px] text-white/30">auto</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs hidden lg:table-cell">
                        {m.startDate
                          ? format(new Date(m.startDate), "dd. MMM yyyy", { locale: de })
                          : "–"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          {m.provisionAmount != null && (
                            <span className="text-white/60 text-xs">
                              {Number(m.provisionAmount).toLocaleString("de-AT", { style: "currency", currency: "EUR" })}
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${provCfg.className}`}>
                            {provCfg.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
