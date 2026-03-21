"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendAlternativeProposalEmail } from "@/lib/emails/alternativeProposals";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getKundeProfile() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!clientProfile) throw new Error("Kein Kundenprofil gefunden.");
  return { session, clientProfile };
}

export async function selectProposal(proposalId: string) {
  const { clientProfile } = await getKundeProfile();

  const proposal = await prisma.meetingProposal.findFirst({
    where: {
      id: proposalId,
      status: "OPEN",
      match: { clientProfileId: clientProfile.id },
    },
    include: {
      match: {
        include: {
          caregiverProfile: { include: { user: true } },
          clientProfile: { include: { user: true } },
        },
      },
    },
  });

  if (!proposal) return { error: "Terminvorschlag nicht gefunden." };

  const { confirmProposal } = await import("@/lib/confirmProposal");
  return confirmProposal(proposal, proposal.tenantId);
}

const AlternativeSchema = z.object({
  matchId: z.string().min(1),
  slots: z
    .array(
      z.object({
        proposedAt: z.string().min(1),
        durationMin: z.coerce.number().refine((v) => v === 30 || v === 60),
      })
    )
    .min(1)
    .max(3),
});

export async function proposeAlternatives(data: z.infer<typeof AlternativeSchema>) {
  const { clientProfile, session } = await getKundeProfile();
  const parsed = AlternativeSchema.parse(data);

  // Verify match belongs to this client
  const match = await prisma.match.findFirst({
    where: { id: parsed.matchId, clientProfileId: clientProfile.id },
    include: {
      caregiverProfile: { include: { user: true } },
      clientProfile: { include: { user: true } },
      tenant: {
        include: {
          memberships: {
            where: { role: "VERMITTLER_ADMIN" },
            include: { user: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!match) return { error: "Match nicht gefunden." };

  // Decline existing OPEN proposals from Pfleger/Vermittler side
  await prisma.meetingProposal.updateMany({
    where: {
      matchId: parsed.matchId,
      status: "OPEN",
      proposedBy: { in: ["PFLEGER", "VERMITTLER"] },
    },
    data: { status: "DECLINED" },
  });

  // Create new proposals from Kunde
  const slots = parsed.slots.map((s) => ({
    tenantId: match.tenantId,
    matchId: parsed.matchId,
    proposedAt: new Date(s.proposedAt),
    durationMin: s.durationMin,
    proposedBy: "KUNDE" as const,
  }));

  await prisma.meetingProposal.createMany({ data: slots });

  // Send email to Pfleger + Vermittler
  const kundeUser = match.clientProfile.user;
  const caregiverUser = match.caregiverProfile.user;
  const vermittlerEmail = match.tenant.memberships[0]?.user?.email;
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://pflegematch.at";

  const recipients = [caregiverUser.email, ...(vermittlerEmail ? [vermittlerEmail] : [])];

  try {
    await sendAlternativeProposalEmail({
      to: recipients,
      recipientName: "Team",
      kundenName: kundeUser.name ?? kundeUser.email,
      proposals: slots.map((s) => ({ proposedAt: s.proposedAt, durationMin: s.durationMin })),
      matchesUrl: `${baseUrl}/vermittler/matches`,
    });
  } catch (err) {
    console.error("Fehler beim Senden der Alternativ-E-Mail:", err);
  }

  revalidatePath("/kunde/matches");
  return { success: true };
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
