"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getKundeProfile() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!clientProfile) throw new Error("Kein Kundenprofil gefunden.");
  return { session, clientProfile };
}

export async function acceptMatch(matchId: string) {
  const { clientProfile } = await getKundeProfile();

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      clientProfileId: clientProfile.id,
      status: "PENDING",
    },
  });

  if (!match) return { error: "Match nicht gefunden oder falscher Status." };

  await prisma.match.update({
    where: { id: matchId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/kunde/matches");
  revalidatePath("/vermittler/matches");
  return { success: true };
}

export async function confirmKennenlernen(matchId: string, confirmed: boolean) {
  const { clientProfile } = await getKundeProfile();

  const match = await prisma.match.findFirst({
    where: { id: matchId, clientProfileId: clientProfile.id },
    select: { id: true },
  });
  if (!match) return { error: "Match nicht gefunden." };

  await prisma.match.update({
    where: { id: matchId },
    data: {
      clientConfirmed:   confirmed,
      clientConfirmedAt: new Date(),
    },
  });

  revalidatePath("/kunde/matches");
  revalidatePath("/vermittler/matches");
  return { ok: true };
}
