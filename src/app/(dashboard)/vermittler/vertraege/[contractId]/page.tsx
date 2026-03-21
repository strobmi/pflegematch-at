import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import ContractEditForm from "@/components/dashboard/vertraege/ContractEditForm";

export default async function VertragDetailPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const { contractId } = await params;
  const session = await requireTenantSession();

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, tenantId: session.tenantId },
    include: {
      caregiverProfile: { select: { user: { select: { name: true, email: true } } } },
      clientProfile:    { select: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!contract) redirect("/vermittler/vertraege");

  const data = {
    id:                      contract.id,
    matchId:                 contract.matchId,
    contractNumber:          contract.contractNumber,
    contractNumberCaregiver: contract.contractNumberCaregiver,
    contractNumberClient:    contract.contractNumberClient,
    status:                  contract.status,
    startDate:        contract.startDate,
    endDate:          contract.endDate,
    noticePeriodDays: contract.noticePeriodDays,
    matchFeeAmount:   contract.matchFeeAmount   != null ? Number(contract.matchFeeAmount)   : null,
    monthlyFeeAmount: contract.monthlyFeeAmount != null ? Number(contract.monthlyFeeAmount) : null,
    notes:            contract.notes,
    caregiverName:    contract.caregiverProfile.user.name  ?? contract.caregiverProfile.user.email ?? "–",
    caregiverEmail:   contract.caregiverProfile.user.email ?? "–",
    clientName:       contract.clientProfile.user.name     ?? contract.clientProfile.user.email    ?? "–",
    clientEmail:      contract.clientProfile.user.email    ?? "–",
    createdAt:        contract.createdAt,
  };

  return (
    <>
      <div className="flex items-center gap-2 px-8 pt-8">
        <Link
          href="/vermittler/vertraege"
          className="p-1.5 rounded-lg text-[#2D2D2D]/40 hover:text-[#2D2D2D] hover:bg-[#FAF6F1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <FileText className="w-5 h-5 text-[#C06B4A]" />
      </div>
      <ContractEditForm contract={data} />
    </>
  );
}
