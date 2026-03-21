import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import VertraegeTable from "@/components/dashboard/vertraege/VertraegeTable";

export const metadata = { title: "Verträge · pflegematch" };

export default async function VertraegeOverviewPage() {
  const session = await requireTenantSession();

  const contracts = await prisma.contract.findMany({
    where: { tenantId: session.tenantId },
    include: {
      caregiverProfile: { select: { user: { select: { name: true, email: true } } } },
      clientProfile:    { select: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  type C = typeof contracts[number];
  const activeCount     = contracts.filter((c: C) => c.status === "ACTIVE").length;
  const terminatedCount = contracts.filter((c: C) => c.status === "TERMINATED").length;
  const expiredCount    = contracts.filter((c: C) => c.status === "EXPIRED").length;

  const rows = contracts.map((c) => ({
    id:               c.id,
    status:           c.status,
    contractNumber:   c.contractNumber ?? null,
    startDate:        c.startDate,
    matchFeeAmount:   c.matchFeeAmount   != null ? Number(c.matchFeeAmount)   : null,
    monthlyFeeAmount: c.monthlyFeeAmount != null ? Number(c.monthlyFeeAmount) : null,
    caregiverName:    c.caregiverProfile.user.name ?? c.caregiverProfile.user.email ?? "–",
    clientName:       c.clientProfile.user.name    ?? c.clientProfile.user.email    ?? "–",
  }));

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Verträge</h1>
          <p className="text-sm text-[#2D2D2D]/50 mt-0.5">{contracts.length} Einträge</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#F0F7F0] rounded-2xl border border-[#EAD9C8] px-5 py-4">
          <p className="text-xs font-medium text-[#2D2D2D]/50 mb-1">Aktiv</p>
          <p className="text-3xl font-bold text-[#5A7A5A]">{activeCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-4">
          <p className="text-xs font-medium text-[#2D2D2D]/50 mb-1">Gekündigt</p>
          <p className="text-3xl font-bold text-red-500">{terminatedCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-4">
          <p className="text-xs font-medium text-[#2D2D2D]/50 mb-1">Abgelaufen</p>
          <p className="text-3xl font-bold text-gray-400">{expiredCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-4">
          <p className="text-xs font-medium text-[#2D2D2D]/50 mb-1">Gesamt</p>
          <p className="text-3xl font-bold text-[#2D2D2D]">{contracts.length}</p>
        </div>
      </div>

      {/* Table with search + tabs */}
      <VertraegeTable data={rows} />
    </div>
  );
}
