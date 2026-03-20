"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmailChangeConfirmation } from "@/lib/emails/emailChange";

const emailSchema = z.string().email("Ungültige E-Mail-Adresse.");

export async function requestEmailChange(
  newEmail: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, error: "Nicht angemeldet." };

    const parsed = emailSchema.safeParse(newEmail);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const normalizedEmail = parsed.data.toLowerCase().trim();

    // Prüfen ob neue E-Mail bereits vergeben (anderer User)
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return { ok: false, error: "Diese E-Mail-Adresse wird bereits verwendet." };

    // Alte unbenutzte Tokens löschen
    await prisma.emailChangeToken.deleteMany({
      where: { userId: session.user.id, usedAt: null },
    });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden
    const record = await prisma.emailChangeToken.create({
      data: { userId: session.user.id, newEmail: normalizedEmail, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://pflegematch.at";
    const confirmUrl = `${baseUrl}/confirm-email-change?token=${record.token}`;

    await sendEmailChangeConfirmation({ to: normalizedEmail, confirmUrl });
    return { ok: true };
  } catch (err) {
    console.error("requestEmailChange error:", err);
    return { ok: false, error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." };
  }
}

export async function confirmEmailChange(
  token: string
): Promise<{ ok: boolean; newEmail?: string; error?: string }> {
  try {
    const record = await prisma.emailChangeToken.findUnique({ where: { token } });

    if (!record) return { ok: false, error: "Ungültiger Link." };
    if (record.usedAt) return { ok: false, error: "Dieser Link wurde bereits verwendet." };
    if (record.expiresAt < new Date()) return { ok: false, error: "Der Link ist abgelaufen. Bitte fordere eine neue E-Mail-Änderung an." };

    // Race-Condition-Guard: Neue E-Mail noch frei?
    const existing = await prisma.user.findUnique({ where: { email: record.newEmail } });
    if (existing) return { ok: false, error: "Diese E-Mail-Adresse ist inzwischen vergeben." };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { email: record.newEmail },
      }),
      prisma.emailChangeToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true, newEmail: record.newEmail };
  } catch (err) {
    console.error("confirmEmailChange error:", err);
    return { ok: false, error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." };
  }
}
