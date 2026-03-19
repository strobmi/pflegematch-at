import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { notFound } from "next/navigation";
import Link from "next/link";
import ScheduleMeetingForm from "@/components/dashboard/matches/ScheduleMeetingForm";

export default async function NeuVideoTerminPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const session = await requireTenantSession();

  const match = await prisma.match.findFirst({
    where: { id: matchId, tenantId: session.tenantId },
    include: {
      caregiverProfile: { include: { user: true } },
      clientProfile: { include: { user: true } },
    },
  });

  if (!match) notFound();

  const caregiverName =
    match.caregiverProfile.user.name ?? match.caregiverProfile.user.email;
  const clientName =
    match.clientProfile.user.name ?? match.clientProfile.user.email;
  const matchLabel = `${clientName} ↔ ${caregiverName}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#2D2D2D]">
          Neuen Videotermin planen
        </h1>
        <p className="text-sm text-[#2D2D2D]/60 mt-0.5">{matchLabel}</p>
      </div>

      <ScheduleMeetingForm matchId={matchId} matchLabel={matchLabel} />

      <Link
        href={`/vermittler/matches/${matchId}/video`}
        className="inline-flex text-sm text-[#2D2D2D]/50 hover:text-[#2D2D2D] transition"
      >
        ← Zurück zu den Terminen
      </Link>
    </div>
  );
}
