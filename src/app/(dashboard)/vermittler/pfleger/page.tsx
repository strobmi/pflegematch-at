import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Plus, User } from "lucide-react";
import PflegerTable from "@/components/dashboard/pfleger/PflegerTable";

export const metadata = { title: "Pflegekräfte · pflegematch" };

export default async function PflegerListPage() {
  const session = await requireTenantSession();
  const today = new Date();

  const raw = await prisma.caregiverProfile.findMany({
    where: { tenantId: session.tenantId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  const pflegekraefte = JSON.parse(JSON.stringify(raw)) as typeof raw;

  const profileIds = pflegekraefte.map((p) => p.id);

  // Auslastung: aktive / vorgeschlagene Matches pro Pfleger
  const matches = await prisma.match.findMany({
    where: {
      tenantId: session.tenantId,
      caregiverProfileId: { in: profileIds },
      status: { in: ["ACTIVE", "PROPOSED", "PENDING"] },
    },
    select: { caregiverProfileId: true, status: true },
  });

  const matchInfo: Record<string, { active: number; pending: number }> = {};
  for (const m of matches) {
    if (!matchInfo[m.caregiverProfileId]) matchInfo[m.caregiverProfileId] = { active: 0, pending: 0 };
    if (m.status === "ACTIVE") matchInfo[m.caregiverProfileId].active++;
    else matchInfo[m.caregiverProfileId].pending++;
  }

  // Verfügbarkeit: aktuell laufende Einträge aus dem Kalender
  const availabilities = await prisma.caregiverAvailability.findMany({
    where: {
      caregiverProfileId: { in: profileIds },
      startDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
    orderBy: { startDate: "desc" },
    select: { caregiverProfileId: true, status: true },
  });

  // Erster (neuester) Eintrag pro Pfleger
  const availInfo: Record<string, string> = {};
  for (const a of availabilities) {
    if (!availInfo[a.caregiverProfileId]) availInfo[a.caregiverProfileId] = a.status;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Pflegekräfte</h1>
          <p className="text-sm text-[#2D2D2D]/50 mt-0.5">
            {pflegekraefte.length} Einträge
          </p>
        </div>
        <Link
          href="/vermittler/pfleger/neu"
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Pflegekraft hinzufügen
        </Link>
      </div>

      {pflegekraefte.length === 0 ? (
        <div className="text-center py-20 text-[#2D2D2D]/40">
          <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Noch keine Pflegekräfte angelegt</p>
          <p className="text-sm mt-1">Füge die erste Pflegekraft hinzu</p>
        </div>
      ) : (
        <PflegerTable data={pflegekraefte} matchInfo={matchInfo} availInfo={availInfo} />
      )}
    </div>
  );
}
