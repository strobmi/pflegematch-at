import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/scoring";
import { sendNeueAnfrageNotification } from "@/lib/emails/neueAnfrageNotification";
import type { CaregiverAvailability, CaregiverProfile, MatchRequest } from "@prisma/client";

function scoreCaregiverForRequest(
  caregiver: CaregiverProfile & { availabilities: Pick<CaregiverAvailability, "status">[] },
  request: MatchRequest
): number {
  return computeScore(
    { ...caregiver, currentAvailabilityStatus: caregiver.availabilities[0]?.status ?? null },
    { pflegegeldStufe: request.pflegegeldStufe, careNeedsRaw: request.careNeedsRaw }
  ).score;
}

// ─── Auto-Assign ──────────────────────────────────────────────────────────────

export async function autoAssignByScore(matchRequestId: string): Promise<void> {
  const request = await prisma.matchRequest.findUnique({
    where: { id: matchRequestId },
  });
  if (!request) return;

  const now = new Date();

  // Alle aktiven Vermittler-Pfleger holen (Freelancer vorerst ausgeschlossen)
  // Hard Filter: Pfleger mit aktivem VACATION/BLOCKED-Eintrag ausschließen
  const caregivers = await prisma.caregiverProfile.findMany({
    where: {
      isActive: true,
      tenant: { status: "ACTIVE", isPlatform: false },
      NOT: {
        availabilities: {
          some: {
            status: { in: ["VACATION", "BLOCKED"] },
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        },
      },
    },
    include: {
      tenant: true,
      availabilities: {
        where: {
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
        select: { status: true },
        take: 1,
      },
    },
  });

  if (caregivers.length === 0) return; // kein Pfleger → beim Platform-Tenant belassen

  // Scores berechnen und sortieren
  const scored = caregivers
    .map((c) => ({ caregiver: c, score: scoreCaregiverForRequest(c, request) }))
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.caregiver.createdAt.getTime() - b.caregiver.createdAt.getTime()
    );

  const best = scored[0];
  if (best.score === 0) return; // kein sinnvoller Match → beim Platform-Tenant belassen

  const tenantId = best.caregiver.tenantId;

  // Round-Robin: VERMITTLER_ADMIN innerhalb des Tenants
  const admins = await prisma.user.findMany({
    where: {
      role: "VERMITTLER_ADMIN",
      memberships: { some: { tenantId } },
    },
    orderBy: [{ lastAssignedAt: "asc" }, { createdAt: "asc" }],
    take: 1,
  });

  if (admins.length === 0) {
    // Tenant hat keinen Admin → beim nächstbesten Pfleger mit Admin suchen
    for (const { caregiver } of scored.slice(1)) {
      const fallbackTenantId = caregiver.tenantId;
      const fallbackAdmins = await prisma.user.findMany({
        where: { role: "VERMITTLER_ADMIN", memberships: { some: { tenantId: fallbackTenantId } } },
        orderBy: [{ lastAssignedAt: "asc" }, { createdAt: "asc" }],
        take: 1,
      });
      if (fallbackAdmins.length > 0) {
        await prisma.$transaction([
          prisma.matchRequest.update({
            where: { id: matchRequestId },
            data: { tenantId: fallbackTenantId, assignedToUserId: fallbackAdmins[0].id },
          }),
          prisma.user.update({ where: { id: fallbackAdmins[0].id }, data: { lastAssignedAt: new Date() } }),
          prisma.tenant.update({ where: { id: fallbackTenantId }, data: { lastAssignedAt: new Date() } }),
        ]);
        const fallbackAdmin = await prisma.user.findUnique({
          where: { id: fallbackAdmins[0].id },
          select: { email: true, name: true },
        });
        if (fallbackAdmin?.email) {
          await sendNeueAnfrageNotification({
            adminEmail: fallbackAdmin.email,
            adminName: fallbackAdmin.name ?? "Vermittler",
            contactName: request.contactName,
            contactEmail: request.contactEmail ?? "",
            contactPhone: request.contactPhone ?? "",
            dashboardUrl: "https://pflegematch.at/vermittler/anfragen",
          });
        }
        return;
      }
    }
    return; // kein Tenant mit Admin gefunden
  }

  await prisma.$transaction([
    prisma.matchRequest.update({
      where: { id: matchRequestId },
      data: { tenantId, assignedToUserId: admins[0].id },
    }),
    prisma.user.update({ where: { id: admins[0].id }, data: { lastAssignedAt: new Date() } }),
    prisma.tenant.update({ where: { id: tenantId }, data: { lastAssignedAt: new Date() } }),
  ]);

  const admin = await prisma.user.findUnique({
    where: { id: admins[0].id },
    select: { email: true, name: true },
  });
  if (admin?.email) {
    await sendNeueAnfrageNotification({
      adminEmail: admin.email,
      adminName: admin.name ?? "Vermittler",
      contactName: request.contactName,
      contactEmail: request.contactEmail ?? "",
      contactPhone: request.contactPhone ?? "",
      dashboardUrl: "https://pflegematch.at/vermittler/anfragen",
    });
  }
}
