import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Plus, User } from "lucide-react";
import PflegerTable from "@/components/dashboard/pfleger/PflegerTable";

export const metadata = { title: "Pflegekräfte · pflegematch" };

export default async function PflegerListPage() {
  const session = await requireTenantSession();

  const pflegekraefte = await prisma.caregiverProfile.findMany({
    where: { tenantId: session.tenantId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

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
        <PflegerTable data={pflegekraefte} />
      )}
    </div>
  );
}
