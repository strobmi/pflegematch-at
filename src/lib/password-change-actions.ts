"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, error: "Nicht angemeldet." };

    if (newPassword.length < 8) {
      return { ok: false, error: "Das neue Passwort muss mindestens 8 Zeichen lang sein." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) return { ok: false, error: "Kein Passwort gesetzt." };

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "Das aktuelle Passwort ist falsch." };

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return { ok: true };
  } catch (err) {
    console.error("changePassword error:", err);
    return { ok: false, error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." };
  }
}
