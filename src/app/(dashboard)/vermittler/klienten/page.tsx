import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Plus, HeartHandshake } from "lucide-react";
import KlientenTable from "@/components/dashboard/klienten/KlientenTable";

export const metadata = { title: "Klienten · pflegematch" };

export default async function KlientenListPage() {
  const session = await requireTenantSession();

  const klienten = await prisma.clientProfile.findMany({
    where: { tenantId: session.tenantId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Klienten</h1>
          <p className="text-sm text-[#2D2D2D]/50 mt-0.5">{klienten.length} Einträge</p>
        </div>
        <Link
          href="/vermittler/klienten/neu"
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Klient hinzufügen
        </Link>
      </div>

      {klienten.length === 0 ? (
        <div className="text-center py-20 text-[#2D2D2D]/40">
          <HeartHandshake className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Noch keine Klienten angelegt</p>
        </div>
      ) : (
        <KlientenTable data={klienten} />
      )}
    </div>
  );
}
