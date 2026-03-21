"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function confirmKennenlernen(matchId: string, confirmed: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Nicht eingeloggt." };

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Kein Pfleger-Profil gefunden." };

  const match = await prisma.match.findFirst({
    where: { id: matchId, caregiverProfileId: profile.id },
    select: { id: true },
  });
  if (!match) return { error: "Match nicht gefunden." };

  await prisma.match.update({
    where: { id: matchId },
    data: {
      caregiverConfirmed:   confirmed,
      caregiverConfirmedAt: new Date(),
    },
  });

  revalidatePath("/de/dashboard/pfleger/matches");
  return { ok: true };
}
