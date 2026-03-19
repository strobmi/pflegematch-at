"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { MatchStatus } from "@prisma/client";

const CreateMatchSchema = z.object({
  caregiverProfileId: z.string().min(1, "Pflegekraft wählen"),
  clientProfileId: z.string().min(1, "Klient wählen"),
  score: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
});

export type CreateMatchData = z.infer<typeof CreateMatchSchema>;

export async function createMatch(data: CreateMatchData) {
  const session = await requireTenantSession();
  const parsed = CreateMatchSchema.parse(data);

  // Verify both profiles belong to this tenant
  const [caregiver, client] = await Promise.all([
    prisma.caregiverProfile.findFirst({
      where: { id: parsed.caregiverProfileId, tenantId: session.tenantId },
    }),
    prisma.clientProfile.findFirst({
      where: { id: parsed.clientProfileId, tenantId: session.tenantId },
    }),
  ]);

  if (!caregiver || !client) return { error: "Ungültige Auswahl." };

  await prisma.match.create({
    data: {
      tenantId: session.tenantId,
      caregiverProfileId: parsed.caregiverProfileId,
      clientProfileId: parsed.clientProfileId,
      score: parsed.score,
      notes: parsed.notes,
      startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
      status: "PROPOSED",
    },
  });

  revalidatePath("/vermittler/matches");
  redirect("/vermittler/matches");
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  const session = await requireTenantSession();

  const match = await prisma.match.findFirst({
    where: { id: matchId, tenantId: session.tenantId },
  });
  if (!match) return { error: "Nicht gefunden." };

  await prisma.match.update({ where: { id: matchId }, data: { status } });
  revalidatePath("/vermittler/matches");
}

export async function deleteMatch(matchId: string) {
  const session = await requireTenantSession();
  const match = await prisma.match.findFirst({
    where: { id: matchId, tenantId: session.tenantId },
  });
  if (!match) return { error: "Nicht gefunden." };
  await prisma.match.delete({ where: { id: matchId } });
  revalidatePath("/vermittler/matches");
}
