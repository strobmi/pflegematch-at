import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Inbox } from "lucide-react";
import AnfragenTable from "@/components/dashboard/admin/AnfragenTable";

export const metadata = { title: "Anfragen · Admin · pflegematch" };

export default async function AdminAnfragenPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const [requests, tenants] = await Promise.all([
    prisma.matchRequest.findMany({
      where: { isProcessed: false, tenant: { isPlatform: true } },
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true, isPlatform: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const unassigned = requests.filter((r) => r.tenant?.isPlatform === true);
  const assigned   = requests.filter((r) => r.tenant?.isPlatform === false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Eingehende Anfragen</h1>
          <p className="text-sm text-white/50 mt-0.5">
            {unassigned.length} nicht zugewiesen · {assigned.length} zugewiesen
          </p>
        </div>
      </div>

      {/* Unassigned */}
      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
          Nicht zugewiesen ({unassigned.length})
        </h2>
        {unassigned.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-white/20" />
            <p className="text-white/30 text-sm">Alle Anfragen sind zugewiesen.</p>
          </div>
        ) : (
          <AnfragenTable requests={unassigned} tenants={tenants} />
        )}
      </div>

      {/* Assigned but not yet processed */}
      {assigned.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
            Zugewiesen, noch offen ({assigned.length})
          </h2>
          <AnfragenTable requests={assigned} tenants={tenants} showAssigned />
        </div>
      )}
    </div>
  );
}
