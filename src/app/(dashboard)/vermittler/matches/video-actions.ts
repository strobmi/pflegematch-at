"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { createWherebyMeeting, deleteWherebyMeeting } from "@/lib/whereby";
import {
  sendMeetingScheduledEmail,
  sendMeetingCancelledEmail,
} from "@/lib/emails/meetingInvite";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ScheduleMeetingSchema = z.object({
  scheduledAt: z.string().min(1, "Bitte Datum und Uhrzeit wählen"),
  durationMin: z.coerce.number().refine((v) => v === 30 || v === 60, {
    message: "Dauer muss 30 oder 60 Minuten sein",
  }),
  notes: z.string().optional(),
});

export type ScheduleMeetingData = z.infer<typeof ScheduleMeetingSchema>;

export async function scheduleVideoMeeting(
  matchId: string,
  data: ScheduleMeetingData
) {
  const session = await requireTenantSession();
  const parsed = ScheduleMeetingSchema.parse(data);
  const scheduledAt = new Date(parsed.scheduledAt);

  // Verify match belongs to this tenant
  const match = await prisma.match.findFirst({
    where: { id: matchId, tenantId: session.tenantId },
    include: {
      caregiverProfile: { include: { user: true } },
      clientProfile: { include: { user: true } },
    },
  });

  if (!match) return { error: "Match nicht gefunden." };

  // Create Whereby room
  let wherebyData;
  try {
    wherebyData = await createWherebyMeeting(scheduledAt, parsed.durationMin);
  } catch (err) {
    console.error("Whereby error:", err);
    return { error: "Videoraum konnte nicht erstellt werden. Bitte erneut versuchen." };
  }

  // Save to DB
  const meeting = await prisma.videoMeeting.create({
    data: {
      tenantId: session.tenantId,
      matchId,
      wherebyMeetingId: wherebyData.meetingId,
      roomUrl: wherebyData.roomUrl,
      hostRoomUrl: wherebyData.hostRoomUrl,
      scheduledAt,
      durationMin: parsed.durationMin,
      notes: parsed.notes,
    },
  });

  // Send email notifications
  const caregiverUser = match.caregiverProfile.user;
  const clientUser = match.clientProfile.user;

  await Promise.all([
    sendMeetingScheduledEmail({
      to: clientUser.email,
      recipientName: clientUser.name ?? clientUser.email,
      partnerName: caregiverUser.name ?? caregiverUser.email,
      scheduledAt,
      durationMin: parsed.durationMin,
      joinUrl: wherebyData.roomUrl,
      notes: parsed.notes,
    }),
    sendMeetingScheduledEmail({
      to: caregiverUser.email,
      recipientName: caregiverUser.name ?? caregiverUser.email,
      partnerName: clientUser.name ?? clientUser.email,
      scheduledAt,
      durationMin: parsed.durationMin,
      joinUrl: wherebyData.roomUrl,
      notes: parsed.notes,
    }),
  ]);

  revalidatePath("/vermittler/matches");
  revalidatePath(`/vermittler/matches/${matchId}/video`);
  redirect(`/vermittler/matches/${matchId}/video`);
}

export async function cancelVideoMeeting(meetingId: string) {
  const session = await requireTenantSession();

  const meeting = await prisma.videoMeeting.findFirst({
    where: { id: meetingId, tenantId: session.tenantId },
    include: {
      match: {
        include: {
          caregiverProfile: { include: { user: true } },
          clientProfile: { include: { user: true } },
        },
      },
    },
  });

  if (!meeting) return { error: "Termin nicht gefunden." };

  // Delete Whereby room
  try {
    await deleteWherebyMeeting(meeting.wherebyMeetingId);
  } catch (err) {
    console.error("Whereby delete error:", err);
    // Continue with DB update even if Whereby deletion fails
  }

  await prisma.videoMeeting.update({
    where: { id: meetingId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  // Send cancellation emails
  const caregiverUser = meeting.match.caregiverProfile.user;
  const clientUser = meeting.match.clientProfile.user;

  await Promise.all([
    sendMeetingCancelledEmail({
      to: clientUser.email,
      recipientName: clientUser.name ?? clientUser.email,
      partnerName: caregiverUser.name ?? caregiverUser.email,
      scheduledAt: meeting.scheduledAt,
    }),
    sendMeetingCancelledEmail({
      to: caregiverUser.email,
      recipientName: caregiverUser.name ?? caregiverUser.email,
      partnerName: clientUser.name ?? clientUser.email,
      scheduledAt: meeting.scheduledAt,
    }),
  ]);

  revalidatePath("/vermittler/matches");
  revalidatePath(`/vermittler/matches/${meeting.matchId}/video`);
}

// Void wrapper for use in HTML <form action={...}>
export async function cancelVideoMeetingAction(meetingId: string): Promise<void> {
  await cancelVideoMeeting(meetingId);
}
