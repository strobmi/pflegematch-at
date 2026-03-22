import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";
import TenantEditForm from "@/components/dashboard/admin/TenantEditForm";
import { updateTenant, deleteTenant, assignPricingPlan } from "../../actions";
import { getActivePlan, getPendingPlan } from "@/lib/pricing";

export const metadata = { title: "Vermittler bearbeiten · Admin · pflegematch" };

export default async function TenantBearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const { id } = await params;

  const [tenant, allPlans, activePlanAssignment, pendingPlanAssignment] = await Promise.all([
    prisma.tenant.findUnique({ where: { id } }),
    prisma.pricingPlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getActivePlan(id),
    getPendingPlan(id),
  ]);
  if (!tenant) notFound();

  const defaultValues = {
    tenantName:       tenant.name,
    tenantSlug:       tenant.slug,
    tenantEmail:      tenant.email,
    tenantPhone:      tenant.phone ?? "",
    tenantAddress:    tenant.address ?? "",
    status:           tenant.status,
    defaultMatchFee:   tenant.defaultMatchFee   ? Number(tenant.defaultMatchFee)   : undefined,
    defaultMonthlyFee: tenant.defaultMonthlyFee ? Number(tenant.defaultMonthlyFee) : undefined,
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/tenants"
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Vermittler bearbeiten</h1>
          <p className="text-sm text-white/40 mt-0.5">{tenant.name}</p>
        </div>
      </div>

      <div className="mb-4">
        <Link
          href={`/admin/tenants/${id}/pfleger`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Users className="w-4 h-4" />
          Pflegekräfte zuordnen
        </Link>
      </div>

      <TenantEditForm
        tenantId={id}
        defaultValues={defaultValues}
        onSubmit={updateTenant}
        onDelete={deleteTenant}
        allPlans={allPlans.map((p) => ({ id: p.id, name: p.name, slug: p.slug, monthlyFee: Number(p.monthlyFee), matchFee: Number(p.matchFee) }))}
        activePlan={activePlanAssignment ? { name: activePlanAssignment.plan.name, monthlyFee: Number(activePlanAssignment.plan.monthlyFee), matchFee: Number(activePlanAssignment.plan.matchFee) } : null}
        pendingPlan={pendingPlanAssignment ? { name: pendingPlanAssignment.plan.name, effectiveFrom: pendingPlanAssignment.effectiveFrom.toISOString() } : null}
        onAssignPlan={assignPricingPlan}
      />
    </div>
  );
}
