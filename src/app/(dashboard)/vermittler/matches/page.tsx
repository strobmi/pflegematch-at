import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Plus, Link2, ArrowRight } from "lucide-react";
import MatchTable from "@/components/dashboard/matches/MatchTable";
import { computeScore } from "@/lib/scoring";

export const metadata = { title: "Matches · pflegematch" };

const FUNNEL_STAGES = [
  { status: "PENDING",   label: "Ausstehend",     color: "#D97706", bg: "#FEF3C7", textColor: "#D97706" },
  { status: "ACCEPTED",  label: "Akzeptiert",     color: "#5A7A5A", bg: "#F0F7F0", textColor: "#5A7A5A" },
  { status: "ACTIVE",    label: "Aktiv",           color: "#7B9E7B", bg: "#DCFCE7", textColor: "#166534" },
  { status: "COMPLETED", label: "Abgeschlossen",  color: "#6B7280", bg: "#F3F4F6", textColor: "#374151" },
  { status: "CANCELLED", label: "Storniert",      color: "#9CA3AF", bg: "#F9FAFB", textColor: "#6B7280" },
] as const;

export default async function MatchesPage() {
  const session = await requireTenantSession();

  const rawMatches = await prisma.match.findMany({
    where: { tenantId: session.tenantId },
    include: {
      caregiverProfile: {
        include: { user: { select: { name: true } } },
      },
      clientProfile: {
        include: { user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Decimal → number serialisieren (Client Components akzeptieren keine Prisma Decimal-Objekte)
  const matches = rawMatches.filter((m) => m.caregiverProfile != null && m.clientProfile != null).map((m) => ({
    ...m,
    caregiverProfile: m.caregiverProfile
      ? { ...m.caregiverProfile, hourlyRate: m.caregiverProfile.hourlyRate ? Number(m.caregiverProfile.hourlyRate) : null }
      : null,
  }));

  // ── KPI calculations ──────────────────────────────────────
  const activeCount    = matches.filter((m) => m.status === "ACTIVE").length;
  const completedCount = matches.filter((m) => m.status === "COMPLETED").length;

  // Ø Score über abgeschlossene Matches – via computeScore berechnet
  const completedMatches = rawMatches.filter(
    (m) => m.status === "COMPLETED" && m.caregiverProfile && m.clientProfile
  );
  const completedScores = completedMatches.map((m) =>
    computeScore(
      {
        pflegestufe: m.caregiverProfile!.pflegestufe,
        languages: m.caregiverProfile!.languages,
        availability: m.caregiverProfile!.availability,
        averageRating: m.caregiverProfile!.averageRating,
      },
      {
        pflegegeldStufe: m.clientProfile!.pflegegeldStufe ?? null,
        careNeedsRaw: null,
      }
    ).score
  );
  const avgScore = completedScores.length > 0
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : null;

  const countByStatus = (status: string) => matches.filter((m) => m.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Matches</h1>
          <p className="text-sm text-[#2D2D2D]/50 mt-0.5">{matches.length} Einträge</p>
        </div>
        <Link
          href="/vermittler/matches/neu"
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Match erstellen
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 text-[#2D2D2D]/40">
          <Link2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Noch keine Matches erstellt</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Gesamt",        value: matches.length, suffix: "",  accent: "#2D2D2D", bg: "bg-white" },
              { label: "Aktiv",         value: activeCount,    suffix: "",  accent: "#7B9E7B", bg: "bg-[#F0F7F0]" },
              { label: "Abgeschlossen", value: completedCount, suffix: "",  accent: "#9CA3AF", bg: "bg-white" },
              { label: "Ø Score (abgeschl.)", value: avgScore, suffix: "%", accent: "#C06B4A", bg: "bg-[#FDF5F0]" },
            ].map(({ label, value, suffix, accent, bg }) => (
              <div key={label} className={`${bg} rounded-2xl border border-[#EAD9C8] px-5 py-4`}>
                <p className="text-xs font-medium text-[#2D2D2D]/50 mb-1">{label}</p>
                <p className="text-3xl font-bold" style={{ color: accent }}>
                  {value != null ? `${value}${suffix}` : "–"}
                </p>
              </div>
            ))}
          </div>

          {/* ── Pipeline Funnel ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
            <p className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wider mb-4">
              Pipeline
            </p>
            <div className="flex items-stretch gap-2">
              {FUNNEL_STAGES.map((stage, i) => {
                const count = countByStatus(stage.status);
                const isLast = i === FUNNEL_STAGES.length - 1;
                return (
                  <div key={stage.status} className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="flex-1 rounded-xl px-4 py-3 text-center"
                      style={{ backgroundColor: stage.bg }}
                    >
                      <p className="text-2xl font-bold" style={{ color: stage.color }}>
                        {count}
                      </p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: stage.textColor }}>
                        {stage.label}
                      </p>
                    </div>
                    {!isLast && (
                      <ArrowRight className="w-4 h-4 text-[#2D2D2D]/20 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Table ──────────────────────────────────────────── */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <MatchTable data={matches as any} />
        </>
      )}
    </div>
  );
}
