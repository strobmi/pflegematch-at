import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import AnfragenTable from "@/components/dashboard/admin/AnfragenTable";

export const metadata = { title: "Anfragen · Admin · pflegematch" };

export default async function AdminAnfragenPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const [requests, tenants] = await Promise.all([
    prisma.matchRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tenant: { select: { id: true, name: true, isPlatform: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.tenant.findMany({
      where: { status: "ACTIVE", isPlatform: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const unassignedCount = requests.filter((r) => !r.isProcessed && r.tenant?.isPlatform).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Eingehende Anfragen</h1>
        <p className="text-sm text-white/50 mt-0.5">
          {unassignedCount} nicht zugewiesen · {requests.length} gesamt
        </p>
      </div>

      <AnfragenTable requests={requests} tenants={tenants} />
    </div>
  );
}
