"use server";

import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { z } from "zod";

async function loadValidToken(token: string) {
  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  if (!invite || invite.usedAt !== null || invite.expiresAt < new Date()) {
    return null;
  }
  return invite;
}

export async function acceptInviteNewUser(
  token: string,
  name: string,
  password: string
): Promise<{ error?: string }> {
  const parsed = z
    .object({
      name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
      password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
    })
    .safeParse({ name, password });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const invite = await loadValidToken(token);
  if (!invite) return { error: "Einladung ungültig oder abgelaufen." };

  // Race-Condition-Guard: E-Mail bereits vergeben?
  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return { error: "Diese E-Mail ist bereits registriert. Bitte melden Sie sich an." };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: invite.email,
        name: parsed.data.name,
        passwordHash,
        role: "VERMITTLER_ADMIN",
      },
    });
    await tx.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId: invite.tenantId,
        role: "VERMITTLER_ADMIN",
      },
    });
    await tx.inviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
  });

  return {};
}

export async function acceptInviteExistingUser(
  token: string,
  password: string
): Promise<{ error?: string }> {
  const invite = await loadValidToken(token);
  if (!invite) return { error: "Einladung ungültig oder abgelaufen." };

  const user = await prisma.user.findUnique({
    where: { email: invite.email },
    include: { memberships: true },
  });
  if (!user?.passwordHash) return { error: "Benutzer nicht gefunden." };

  const valid = await compare(password, user.passwordHash);
  if (!valid) return { error: "Falsches Passwort." };

  // Warnung: User ist bereits VERMITTLER_ADMIN in anderem Tenant
  const otherVermittlerMembership = user.memberships.find(
    (m) => m.tenantId !== invite.tenantId && m.role === "VERMITTLER_ADMIN"
  );
  if (otherVermittlerMembership) {
    return {
      error:
        "Ihr Account ist bereits einem anderen Vermittler zugeordnet. Bitte kontaktieren Sie den Support.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.tenantMembership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: invite.tenantId } },
      create: { userId: user.id, tenantId: invite.tenantId, role: "VERMITTLER_ADMIN" },
      update: { role: "VERMITTLER_ADMIN" },
    });
    await tx.inviteToken.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
  });

  return {};
}
