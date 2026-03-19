"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { sendTeamInviteEmail } from "@/lib/emails/teamInvite";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function inviteTeamMember(
  email: string
): Promise<{ error?: string }> {
  const session = await requireTenantSession();

  const parsed = z.string().email("Ungültige E-Mail-Adresse").safeParse(email);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const normalised = parsed.data.toLowerCase().trim();

  // Guard: bereits Mitglied?
  const existingUser = await prisma.user.findUnique({
    where: { email: normalised },
    include: {
      memberships: { where: { tenantId: session.tenantId } },
    },
  });
  if (existingUser?.memberships.length) {
    return { error: "Diese Person ist bereits Teammitglied." };
  }

  // Guard: offene Einladung für diese E-Mail vorhanden?
  const existingToken = await prisma.inviteToken.findFirst({
    where: {
      email: normalised,
      tenantId: session.tenantId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existingToken) {
    return {
      error: "Es wurde bereits eine ausstehende Einladung für diese E-Mail verschickt.",
    };
  }

  const invite = await prisma.inviteToken.create({
    data: {
      tenantId: session.tenantId,
      email: normalised,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const inviteUrl = `${baseUrl}/invite/${invite.token}`;

  await sendTeamInviteEmail({
    to: normalised,
    tenantName: session.tenantName ?? "Ihrem Team",
    inviterName: session.name ?? "Ein Teammitglied",
    inviteUrl,
  });

  revalidatePath("/vermittler/team");
  return {};
}

export async function removeTeamMember(
  memberUserId: string
): Promise<{ error?: string }> {
  const session = await requireTenantSession();

  if (memberUserId === session.id) {
    return { error: "Sie können sich nicht selbst entfernen." };
  }

  const membership = await prisma.tenantMembership.findUnique({
    where: { userId_tenantId: { userId: memberUserId, tenantId: session.tenantId } },
  });
  if (!membership) return { error: "Mitglied nicht gefunden." };

  await prisma.tenantMembership.delete({
    where: { userId_tenantId: { userId: memberUserId, tenantId: session.tenantId } },
  });

  revalidatePath("/vermittler/team");
  return {};
}

export async function revokeInvite(
  tokenId: string
): Promise<{ error?: string }> {
  const session = await requireTenantSession();

  const token = await prisma.inviteToken.findFirst({
    where: { id: tokenId, tenantId: session.tenantId },
  });
  if (!token) return { error: "Einladung nicht gefunden." };

  await prisma.inviteToken.delete({ where: { id: tokenId } });

  revalidatePath("/vermittler/team");
  return {};
}
