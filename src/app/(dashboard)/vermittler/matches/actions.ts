"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { MatchStatus } from "@prisma/client";
import { computeScore } from "@/lib/scoring";
import { sendWelcomeToken } from "@/lib/sendWelcomeToken";
import { sendMatchNotificationEmail } from "@/lib/emails/meetingInvite";

// Reverse-map AvailabilityType → betreuungsart key for careNeedsRaw JSON
const AVAIL_REVERSE: Partial<Record<string, string>> = {
  LIVE_IN:   "24h",
  HOURLY:    "stundenweise",
  PART_TIME: "tagesbetreuung",
};

const CreateMatchSchema = z.object({
  caregiverProfileId: z.string().min(1, "Pflegekraft wählen"),
  clientProfileId: z.string().min(1, "Klient wählen"),
  notes: z.string().optional(),
  startDate: z.string().optional(),
});

export type CreateMatchData = z.infer<typeof CreateMatchSchema>;

export async function createMatch(data: CreateMatchData) {
  const session = await requireTenantSession();
  const parsed = CreateMatchSchema.parse(data);

  const [caregiver, client] = await Promise.all([
    prisma.caregiverProfile.findFirst({
      where: { id: parsed.caregiverProfileId, tenantId: session.tenantId },
      select: {
        id: true,
        pflegestufe: true,
        languages: true,
        availability: true,
        averageRating: true,
        user: { select: { email: true, name: true } },
      },
    }),
    prisma.clientProfile.findFirst({
      where: { id: parsed.clientProfileId, tenantId: session.tenantId },
      select: {
        id: true,
        pflegegeldStufe: true,
        preferredSchedule: true,
        preferredLanguages: true,
        user: { select: { email: true, name: true, passwordHash: true } },
      },
    }),
  ]);

  if (!caregiver || !client) return { error: "Ungültige Auswahl." };

  // Compute score from profile data
  const careNeedsRaw = (() => {
    const obj: Record<string, unknown> = {};
    if (client.preferredSchedule) {
      const betreuungsart = AVAIL_REVERSE[client.preferredSchedule];
      if (betreuungsart) obj.betreuungsart = betreuungsart;
    }
    if (client.preferredLanguages.length > 0) {
      obj.sprachen = client.preferredLanguages.map((lang) => ({ lang }));
    }
    return Object.keys(obj).length > 0 ? JSON.stringify(obj) : null;
  })();

  const { score } = computeScore(
    {
      pflegestufe: caregiver.pflegestufe,
      languages: caregiver.languages,
      availability: caregiver.availability,
      averageRating: caregiver.averageRating,
    },
    { pflegegeldStufe: client.pflegegeldStufe ?? null, careNeedsRaw }
  );

  await prisma.match.create({
    data: {
      tenantId: session.tenantId,
      caregiverProfileId: parsed.caregiverProfileId,
      clientProfileId: parsed.clientProfileId,
      score,
      notes: parsed.notes,
      startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
      status: "PENDING",
    },
  });

  if (client.user && !client.user.passwordHash) {
    await sendWelcomeToken(client.user.email, client.user.name ?? client.user.email);
  }

  await sendMatchNotificationEmail({
    to: caregiver.user.email,
    caregiverName: caregiver.user.name ?? caregiver.user.email,
    clientName: client.user.name ?? client.user.email,
    portalUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://pflegematch.at"}/de/dashboard/pfleger/matches`,
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

  await prisma.$transaction(async (tx) => {
    await tx.match.delete({ where: { id: matchId } });

    await tx.matchRequest.updateMany({
      where: {
        tenantId: session.tenantId,
        clientProfileId: match.clientProfileId,
        isProcessed: true,
      },
      data: {
        isProcessed: false,
        clientProfileId: null,
        processedByUserId: null,
      },
    });
  });

  revalidatePath("/vermittler/matches");
  revalidatePath("/vermittler/anfragen");
}
