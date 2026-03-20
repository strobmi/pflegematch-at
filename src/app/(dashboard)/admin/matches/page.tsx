import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { computeScore } from "@/lib/scoring";
import AdminMatchesTable from "@/components/dashboard/admin/AdminMatchesTable";
import type { MatchRow } from "@/components/dashboard/admin/AdminMatchesTable";

const AVAIL_REVERSE: Partial<Record<string, string>> = {
  LIVE_IN:   "24h",
  HOURLY:    "stundenweise",
  PART_TIME: "tagesbetreuung",
};

export const metadata = { title: "Matches · Admin · pflegematch" };

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

  const rows: MatchRow[] = matches.map((m) => {
    let computedScore: number;
    let scoreIsAuto: boolean;

    if (m.score != null) {
      computedScore = m.score;
      scoreIsAuto   = false;
    } else {
      const obj: Record<string, unknown> = {};
      if (m.clientProfile.preferredSchedule) {
        const b = AVAIL_REVERSE[m.clientProfile.preferredSchedule];
        if (b) obj.betreuungsart = b;
      }
      if (m.clientProfile.preferredLanguages.length > 0)
        obj.sprachen = m.clientProfile.preferredLanguages.map((lang) => ({ lang }));
      const careNeedsRaw = Object.keys(obj).length > 0 ? JSON.stringify(obj) : null;
      computedScore = computeScore(m.caregiverProfile, {
        pflegegeldStufe: m.clientProfile.pflegegeldStufe ?? null,
        careNeedsRaw,
      }).score;
      scoreIsAuto = true;
    }

    return {
      id:               m.id,
      status:           m.status,
      provisionStatus:  m.provisionStatus,
      provisionAmount:  m.provisionAmount != null ? Number(m.provisionAmount) : null,
      startDate:        m.startDate ? m.startDate.toISOString() : null,
      computedScore,
      scoreIsAuto,
      tenant:           m.tenant,
      caregiverProfile: { user: { name: m.caregiverProfile.user.name } },
      clientProfile:    { user: { name: m.clientProfile.user.name } },
    };
  });

  const activeCount    = rows.filter((m) => m.status === "ACTIVE").length;
  const provisionTotal = rows.reduce((sum, m) => sum + (m.provisionAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alle Matches</h1>
          <p className="text-sm text-white/50 mt-0.5">
            {rows.length} gesamt · {activeCount} aktiv
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

      <AdminMatchesTable matches={rows} />
    </div>
  );
}
