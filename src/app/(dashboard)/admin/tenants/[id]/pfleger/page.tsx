import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PflegerZuordnungPanel from "@/components/dashboard/admin/PflegerZuordnungPanel";
import { assignPflegerToTenant, unassignPflegerFromTenant } from "../../actions";

export const metadata = { title: "Pflegekräfte zuordnen · Admin · pflegematch" };

export default async function TenantPflegerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) notFound();

  // Pflegekräfte dieses Vermittlers
  const assigned = await prisma.caregiverProfile.findMany({
    where: { tenantId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Pflegekräfte auf dem Platform-Tenant (noch nicht zugeordnet)
  const platformTenant = await prisma.tenant.findFirst({ where: { isPlatform: true } });
  const unassigned = platformTenant
    ? await prisma.caregiverProfile.findMany({
        where: { tenantId: platformTenant.id },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/tenants/${id}/bearbeiten`}
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Pflegekräfte zuordnen</h1>
          <p className="text-sm text-white/40 mt-0.5">{tenant.name}</p>
        </div>
      </div>

      <PflegerZuordnungPanel
        tenantId={id}
        tenantName={tenant.name}
        assigned={JSON.parse(JSON.stringify(assigned))}
        unassigned={JSON.parse(JSON.stringify(unassigned))}
        onAssign={assignPflegerToTenant}
        onUnassign={unassignPflegerFromTenant}
      />
    </div>
  );
}
