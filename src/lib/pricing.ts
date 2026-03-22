import { prisma } from "@/lib/prisma";

/**
 * Gibt den aktuell aktiven Plan eines Tenants zurück.
 * "Aktiv" = das neueste Assignment mit effectiveFrom <= jetzt.
 */
export async function getActivePlan(tenantId: string) {
  return prisma.tenantPlanAssignment.findFirst({
    where: { tenantId, effectiveFrom: { lte: new Date() } },
    orderBy: { effectiveFrom: "desc" },
    include: { plan: true },
  });
}

/**
 * Gibt das nächste noch-nicht-aktive Assignment zurück (effectiveFrom > jetzt).
 * Wird im Admin-UI als "ausstehender Planwechsel" angezeigt.
 */
export async function getPendingPlan(tenantId: string) {
  return prisma.tenantPlanAssignment.findFirst({
    where: { tenantId, effectiveFrom: { gt: new Date() } },
    orderBy: { effectiveFrom: "asc" },
    include: { plan: true },
  });
}
