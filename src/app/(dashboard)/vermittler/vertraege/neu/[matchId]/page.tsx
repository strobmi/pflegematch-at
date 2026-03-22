import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import ContractForm from "@/components/dashboard/matches/ContractForm";
import { getActivePlan } from "@/lib/pricing";

export const metadata = { title: "Vertrag anlegen · pflegematch" };

export default async function NeuerVertragPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const session = await requireTenantSession();

  const match = await prisma.match.findFirst({
    where: { id: matchId, tenantId: session.tenantId },
    include: {
      caregiverProfile: { select: { user: { select: { name: true, email: true } } } },
      clientProfile:    { select: { user: { select: { name: true, email: true } } } },
      contract:         { select: { id: true } },
    },
  });

  if (!match) redirect("/vermittler/matches");
  if (match.contract) redirect(`/vermittler/vertraege/${match.contract.id}`);

  const [tenant, activePlan] = await Promise.all([
    prisma.tenant.findUnique({
      where:  { id: session.tenantId },
      select: { defaultMatchFee: true, defaultMonthlyFee: true },
    }),
    getActivePlan(session.tenantId),
  ]);

  // Plan-Werte haben Vorrang vor den manuellen Tenant-Defaults
  const defaultMatchFee   = activePlan ? Number(activePlan.plan.matchFee)   : (tenant?.defaultMatchFee   ? Number(tenant.defaultMatchFee)   : null);
  const defaultMonthlyFee = activePlan ? Number(activePlan.plan.monthlyFee) : (tenant?.defaultMonthlyFee ? Number(tenant.defaultMonthlyFee) : null);

  const caregiverName =
    match.caregiverProfile.user.name ?? match.caregiverProfile.user.email;
  const clientName =
    match.clientProfile.user.name ?? match.clientProfile.user.email;

  return (
    <div className="max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-[#C06B4A]" />
        <div>
          <h1 className="text-xl font-semibold text-[#2D2D2D]">Vertrag anlegen</h1>
          <p className="text-sm text-[#2D2D2D]/55">
            Match wird auf AKTIV gesetzt und Gebühren werden gespeichert.
          </p>
        </div>
      </div>

      <ContractForm
        matchId={matchId}
        caregiverName={caregiverName}
        clientName={clientName}
        defaultMatchFee={defaultMatchFee}
        defaultMonthlyFee={defaultMonthlyFee}
        planName={activePlan?.plan.name ?? null}
      />
    </div>
  );
}
