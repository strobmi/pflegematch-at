import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import MatchCreateForm from "@/components/dashboard/matches/MatchCreateForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Match erstellen · pflegematch" };

export default async function NeuerMatchPage() {
  const session = await requireTenantSession();

  const [pflegekraefte, klienten] = await Promise.all([
    prisma.caregiverProfile.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientProfile.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vermittler/matches" className="p-1.5 text-[#2D2D2D]/40 hover:text-[#2D2D2D] hover:bg-white rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Match erstellen</h1>
      </div>
      <MatchCreateForm pflegekraefte={pflegekraefte} klienten={klienten} />
    </div>
  );
}
