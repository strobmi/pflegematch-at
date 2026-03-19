import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Inbox, Plus } from "lucide-react";
import Link from "next/link";
import VermittlerAnfragenTable from "@/components/dashboard/vermittler/VermittlerAnfragenTable";

export const metadata = { title: "Anfragen · pflegematch" };

export default async function VermittlerAnfragenPage() {
  const session = await requireTenantSession();

  const [requests, pfleger] = await Promise.all([
    prisma.matchRequest.findMany({
      where: { tenantId: session.tenantId },
      include: {
        assignedTo:  { select: { name: true } },
        processedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.caregiverProfile.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      select: {
        id: true,
        user: { select: { name: true } },
        pflegestufe: true,
        languages: true,
        availability: true,
        averageRating: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Anfragen</h1>
          <p className="text-sm text-[#2D2D2D]/50 mt-0.5">
            {requests.filter((r) => !r.isProcessed).length} offen · {requests.length} gesamt
          </p>
        </div>
        <Link
          href="/vermittler/anfragen/neu"
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neue Anfrage
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-[#EAD9C8] rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-[#2D2D2D]/20" />
          <p className="text-[#2D2D2D]/40 font-medium">Keine offenen Anfragen</p>
          <p className="text-[#2D2D2D]/30 text-sm mt-1">
            Neue Anfragen erscheinen hier, sobald sie von der Plattform zugewiesen werden.
          </p>
        </div>
      ) : (
        <VermittlerAnfragenTable requests={requests} pfleger={pfleger} />
      )}
    </div>
  );
}
