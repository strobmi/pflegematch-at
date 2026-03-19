"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

// Assign a MatchRequest to a Tenant — round-robin across VERMITTLER_ADMIN users
export async function assignMatchRequest(requestId: string, tenantId: string) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  // Round-Robin: find the VERMITTLER_ADMIN of this tenant with the oldest lastAssignedAt
  const admins = await prisma.user.findMany({
    where: {
      role: "VERMITTLER_ADMIN",
      memberships: { some: { tenantId } },
    },
    orderBy: [
      { lastAssignedAt: "asc" },  // null comes first (never assigned)
      { createdAt: "asc" },
    ],
    take: 1,
  });

  if (admins.length === 0) return { error: "Kein Vermittler-Admin in diesem Tenant gefunden." };

  const assignedAdmin = admins[0];

  await prisma.$transaction([
    prisma.matchRequest.update({
      where: { id: requestId },
      data: {
        tenantId,
        assignedToUserId: assignedAdmin.id,
      },
    }),
    prisma.user.update({
      where: { id: assignedAdmin.id },
      data: { lastAssignedAt: new Date() },
    }),
    prisma.tenant.update({
      where: { id: tenantId },
      data: { lastAssignedAt: new Date() },
    }),
  ]);

  revalidatePath("/admin/anfragen");
}

// Mark a MatchRequest as processed (without assigning)
export async function markProcessed(requestId: string) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  await prisma.matchRequest.update({
    where: { id: requestId },
    data: { isProcessed: true },
  });

  revalidatePath("/admin/anfragen");
}
