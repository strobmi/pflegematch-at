import { prisma } from "@/lib/prisma";
import { createWherebyMeeting } from "@/lib/whereby";
import { sendMeetingScheduledEmail } from "@/lib/emails/meetingInvite";
import { revalidatePath } from "next/cache";
import type { MeetingProposal, Match, CaregiverProfile, ClientProfile, User } from "@prisma/client";

type ProposalWithMatchAndUsers = MeetingProposal & {
  match: Match & {
    caregiverProfile: CaregiverProfile & { user: User };
    clientProfile: ClientProfile & { user: User };
  };
};

export async function confirmProposal(
  proposal: ProposalWithMatchAndUsers,
  tenantId: string
) {
  const { match } = proposal;

  // Create Whereby room
  let wherebyData;
  try {
    wherebyData = await createWherebyMeeting(proposal.proposedAt, proposal.durationMin);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Videoraum konnte nicht erstellt werden: ${msg}` };
  }

  // Transactional: mark proposal SELECTED, decline others, create VideoMeeting, update match status
  await prisma.$transaction(async (tx) => {
    await tx.meetingProposal.update({
      where: { id: proposal.id },
      data: { status: "SELECTED" },
    });

    await tx.meetingProposal.updateMany({
      where: { matchId: proposal.matchId, id: { not: proposal.id }, status: "OPEN" },
      data: { status: "DECLINED" },
    });

    await tx.videoMeeting.create({
      data: {
        tenantId,
        matchId: proposal.matchId,
        wherebyMeetingId: wherebyData.meetingId,
        roomUrl: wherebyData.roomUrl,
        hostRoomUrl: wherebyData.hostRoomUrl,
        scheduledAt: proposal.proposedAt,
        durationMin: proposal.durationMin,
      },
    });

    await tx.match.update({
      where: { id: proposal.matchId },
      data: { status: "PENDING" },
    });
  });

  // Send meeting emails to Pfleger + Kunde
  const caregiverUser = match.caregiverProfile.user;
  const clientUser = match.clientProfile.user;

  await Promise.all([
    sendMeetingScheduledEmail({
      to: clientUser.email,
      recipientName: clientUser.name ?? clientUser.email,
      partnerName: caregiverUser.name ?? caregiverUser.email,
      scheduledAt: proposal.proposedAt,
      durationMin: proposal.durationMin,
      joinUrl: wherebyData.roomUrl,
    }),
    sendMeetingScheduledEmail({
      to: caregiverUser.email,
      recipientName: caregiverUser.name ?? caregiverUser.email,
      partnerName: clientUser.name ?? clientUser.email,
      scheduledAt: proposal.proposedAt,
      durationMin: proposal.durationMin,
      joinUrl: wherebyData.roomUrl,
    }),
  ]);

  revalidatePath("/kunde/matches");
  revalidatePath("/vermittler/matches");
  revalidatePath(`/vermittler/matches/${proposal.matchId}/video`);

  return { success: true };
}
