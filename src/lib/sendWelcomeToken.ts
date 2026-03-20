import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/emails/welcomeInvite";

export async function sendWelcomeToken(email: string, name: string): Promise<void> {
  // Invalidate any existing unused tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email, usedAt: null } });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const record = await prisma.passwordResetToken.create({
    data: { email, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://pflegematch.at";
  const setupUrl = `${baseUrl}/reset-password?token=${record.token}`;

  await sendWelcomeEmail({ to: email, name, setupUrl });
}
