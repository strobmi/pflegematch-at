import { prisma } from "@/lib/prisma";
import type { AvailabilityType, CaregiverProfile, MatchRequest } from "@prisma/client";

// ─── Scoring ──────────────────────────────────────────────────────────────────

const AVAIL_MAP: Partial<Record<string, AvailabilityType[]>> = {
  "24h":            ["LIVE_IN"],
  "stundenweise":   ["HOURLY", "PART_TIME"],
  "tagesbetreuung": ["PART_TIME"],
  "nachtsitzung":   ["PART_TIME", "HOURLY"],
};

function scoreCaregiverForRequest(
  caregiver: CaregiverProfile,
  request: MatchRequest
): number {
  let score = 0;

  let raw: Record<string, unknown> = {};
  try {
    raw = request.careNeedsRaw ? JSON.parse(request.careNeedsRaw) : {};
  } catch {
    // malformed JSON → ignore
  }

  // Pflegestufe (40 Punkte)
  if (request.pflegegeldStufe && caregiver.pflegestufe.includes(request.pflegegeldStufe)) {
    score += 40;
  }

  // Betreuungsart / Availability (30 Punkte)
  const betreuungsart = raw.betreuungsart as string | undefined;
  const expected = betreuungsart ? (AVAIL_MAP[betreuungsart] ?? []) : [];
  if (expected.length === 0 || expected.includes(caregiver.availability)) {
    score += 30;
  }

  // Sprachen (20 Punkte)
  const requestedLangs = Array.isArray(raw.sprachen)
    ? (raw.sprachen as { lang: string }[])
    : [];
  if (requestedLangs.length === 0) {
    score += 10; // keine Sprachanforderung → halbe Punkte
  } else {
    const matched = requestedLangs.filter((s) => caregiver.languages.includes(s.lang));
    score += Math.round((matched.length / requestedLangs.length) * 20);
  }

  // Bewertungs-Bonus (10 Punkte)
  if (caregiver.averageRating) {
    score += Math.round((caregiver.averageRating / 5) * 10);
  }

  return score;
}

// ─── Auto-Assign ──────────────────────────────────────────────────────────────

export async function autoAssignByScore(matchRequestId: string): Promise<void> {
  const request = await prisma.matchRequest.findUnique({
    where: { id: matchRequestId },
  });
  if (!request) return;

  // Alle aktiven Vermittler-Pfleger holen (Freelancer vorerst ausgeschlossen)
  const caregivers = await prisma.caregiverProfile.findMany({
    where: {
      isActive: true,
      tenant: { status: "ACTIVE", isPlatform: false },
    },
    include: { tenant: true },
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
}
