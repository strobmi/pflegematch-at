"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { sendProposalEmail } from "@/lib/emails/meetingProposals";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProposedByRole } from "@prisma/client";

const AddProposalSchema = z.object({
  matchId: z.string().min(1),
  proposedAt: z.string().min(1, "Bitte Datum und Uhrzeit wählen"),
  durationMin: z.coerce.number().refine((v) => v === 30 || v === 60, {
    message: "Dauer muss 30 oder 60 Minuten sein",
  }),
  role: z.enum(["PFLEGER", "VERMITTLER"]),
});

export async function addProposal(data: z.infer<typeof AddProposalSchema>) {
  const session = await requireTenantSession();
  const parsed = AddProposalSchema.parse(data);

  // Verify match belongs to tenant
  const match = await prisma.match.findFirst({
    where: { id: parsed.matchId, tenantId: session.tenantId },
    include: {
      clientProfile: { include: { user: true } },
      caregiverProfile: { include: { user: true } },
      meetingProposals: {
        where: { status: "OPEN", proposedBy: { in: ["PFLEGER", "VERMITTLER"] } },
      },
    },
  });

  if (!match) return { error: "Match nicht gefunden." };

  // Max 3 open proposals from Pfleger/Vermittler side
  if (match.meetingProposals.length >= 3) {
    return { error: "Es können maximal 3 Terminvorschläge gemacht werden." };
  }

  const proposedAt = new Date(parsed.proposedAt);
  if (proposedAt <= new Date()) {
    return { error: "Der Termin muss in der Zukunft liegen." };
  }

  const proposal = await prisma.meetingProposal.create({
    data: {
      tenantId: session.tenantId,
      matchId: parsed.matchId,
      proposedAt,
      durationMin: parsed.durationMin,
      proposedBy: parsed.role as ProposedByRole,
    },
  });

  // If this is the 3rd proposal → send email to Kunde
  const totalOpen = match.meetingProposals.length + 1;
  if (totalOpen === 3) {
    const allProposals = [
      ...match.meetingProposals.map((p) => ({
        proposedAt: p.proposedAt,
        durationMin: p.durationMin,
      })),
      { proposedAt, durationMin: parsed.durationMin },
    ];

    const kundeUser = match.clientProfile.user;
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://pflegematch.at";

    try {
      await sendProposalEmail({
        to: kundeUser.email,
        kundenName: kundeUser.name ?? kundeUser.email,
        proposals: allProposals,
        matchesUrl: `${baseUrl}/kunde/matches`,
      });
    } catch (err) {
      console.error("Fehler beim Senden der Vorschlags-E-Mail:", err);
    }
  }

  revalidatePath(`/vermittler/matches/${parsed.matchId}/video`);
  revalidatePath(`/kunde/matches`);

  return { proposal, totalOpen };
}

export async function removeProposal(proposalId: string) {
  const session = await requireTenantSession();

  const proposal = await prisma.meetingProposal.findFirst({
    where: { id: proposalId, tenantId: session.tenantId, status: "OPEN" },
    include: {
      match: {
        include: {
          meetingProposals: {
            where: { status: "OPEN", proposedBy: { in: ["PFLEGER", "VERMITTLER"] } },
          },
        },
      },
    },
  });

  if (!proposal) return { error: "Vorschlag nicht gefunden." };

  // Only allow removal if email hasn't been sent yet (< 3 proposals)
  if (proposal.match.meetingProposals.length >= 3) {
    return { error: "E-Mail wurde bereits versandt. Vorschlag kann nicht mehr gelöscht werden." };
  }

  await prisma.meetingProposal.delete({ where: { id: proposalId } });

  revalidatePath(`/vermittler/matches/${proposal.matchId}/video`);
  revalidatePath("/kunde/matches");
  return { success: true };
}

// Used by Pfleger portal to add proposals (shared logic, different role)
export async function addPflegerProposal(data: Omit<z.infer<typeof AddProposalSchema>, "role">) {
  return addProposal({ ...data, role: "PFLEGER" });
}

// Used by Vermittler to select one of the Kunde's counter-proposals
export async function selectAlternativeProposal(proposalId: string) {
  const session = await requireTenantSession();

  const proposal = await prisma.meetingProposal.findFirst({
    where: {
      id: proposalId,
      tenantId: session.tenantId,
      status: "OPEN",
      proposedBy: "KUNDE",
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

  if (!proposal) return { error: "Vorschlag nicht gefunden." };

  // Delegate to the shared confirmation logic
  const { confirmProposal } = await import("@/lib/confirmProposal");
  return confirmProposal(proposal, session.tenantId);
}
