import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import PflegekraefteTable from "@/components/dashboard/admin/PflegekraefteTable";
import { assignPflegerToTenant, unassignPflegerFromTenant } from "../tenants/actions";

export const metadata = { title: "Pflegekräfte · Admin · pflegematch" };

export default async function PflegekraeftePage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const [allCaregivers, allTenants, platformTenant] = await Promise.all([
    prisma.caregiverProfile.findMany({
      include: {
        user:   { select: { id: true, name: true, email: true } },
        tenant: { select: { id: true, name: true, isPlatform: true } },
        _count: { select: { matchesAsPfleger: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.findMany({
      where:   { isPlatform: false, status: "ACTIVE" },
      orderBy: { name: "asc" },
      select:  { id: true, name: true },
    }),
    prisma.tenant.findFirst({ where: { isPlatform: true }, select: { id: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pflegekräfte</h1>
        <p className="text-sm text-white/50 mt-0.5">{allCaregivers.length} registrierte Pflegekraft{allCaregivers.length !== 1 ? "en" : ""}</p>
      </div>

      <PflegekraefteTable
        caregivers={allCaregivers.map((c) => ({
          id:           c.id,
          userId:       c.userId,
          type:         c.type,
          isActive:     c.isActive,
          availability: c.availability,
          locationCity: c.locationCity,
          matchCount:   c._count.matchesAsPfleger,
          user:         c.user,
          tenant:       c.tenant,
        }))}
        allTenants={allTenants}
        platformTenantId={platformTenant?.id ?? ""}
        onAssign={assignPflegerToTenant}
        onUnassign={unassignPflegerFromTenant}
      />
    </div>
  );
}
