"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendKeinKontoNotification } from "@/lib/emails/keinKontoNotification";
import { sendPasswordResetEmail } from "@/lib/emails/passwordReset";

export async function notifyKeinKonto(): Promise<{ ok: boolean }> {
  try {
    await sendKeinKontoNotification();
    return { ok: true };
  } catch (err) {
    console.error("notifyKeinKonto error:", err);
    return { ok: false };
  }
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean }> {
  // Always return ok to avoid email enumeration
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: true };

    // Invalidate any existing unused tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email, usedAt: null },
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const record = await prisma.passwordResetToken.create({
      data: { email, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://pflegematch.at";
    const resetUrl = `${baseUrl}/reset-password?token=${record.token}`;

    await sendPasswordResetEmail({ to: email, resetUrl });
    return { ok: true };
  } catch (err) {
    console.error("requestPasswordReset error:", err);
    return { ok: false };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record) return { ok: false, error: "Ungültiger Link." };
    if (record.usedAt) return { ok: false, error: "Dieser Link wurde bereits verwendet." };
    if (record.expiresAt < new Date()) return { ok: false, error: "Der Link ist abgelaufen. Bitte fordere einen neuen an." };

    if (newPassword.length < 8) {
      return { ok: false, error: "Das Passwort muss mindestens 8 Zeichen lang sein." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return { ok: true };
  } catch (err) {
    console.error("resetPassword error:", err);
    return { ok: false, error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." };
  }
}
