import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import MatchCreateForm from "@/components/dashboard/matches/MatchCreateForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Match erstellen · pflegematch" };

export default async function NeuerMatchPage() {
  const session = await requireTenantSession();

  const now = new Date();

  const [pflegekraefte, klienten] = await Promise.all([
    prisma.caregiverProfile.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      select: {
        id: true,
        locationCity: true,
        availability: true,
        pflegestufe: true,
        languages: true,
        averageRating: true,
        user: { select: { name: true } },
        availabilities: {
          where: {
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
          select: { status: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientProfile.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      select: {
        id: true,
        locationCity: true,
        pflegegeldStufe: true,
        preferredLanguages: true,
        preferredSchedule: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pflegekraefteFormatted = pflegekraefte.map((p) => ({
    ...p,
    averageRating: p.averageRating ? Number(p.averageRating) : null,
    currentAvailabilityStatus: p.availabilities[0]?.status ?? null,
  }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vermittler/matches" className="p-1.5 text-[#2D2D2D]/40 hover:text-[#2D2D2D] hover:bg-white rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Match erstellen</h1>
      </div>
      <MatchCreateForm pflegekraefte={pflegekraefteFormatted} klienten={klienten} />
    </div>
  );
}
