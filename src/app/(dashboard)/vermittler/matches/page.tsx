import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Plus, Link2 } from "lucide-react";
import MatchTable from "@/components/dashboard/matches/MatchTable";

export const metadata = { title: "Matches · pflegematch" };

export default async function MatchesPage() {
  const session = await requireTenantSession();

  const matches = await prisma.match.findMany({
    where: { tenantId: session.tenantId },
    include: {
      caregiverProfile: { include: { user: { select: { name: true } } } },
      clientProfile:    { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
        <MatchTable data={matches} />
      )}
    </div>
  );
}
