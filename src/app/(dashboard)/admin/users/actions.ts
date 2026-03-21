"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { z } from "zod";

const UserEditSchema = z.object({
  name:      z.string().min(2, "Min. 2 Zeichen"),
  email:     z.string().email("Ungültige E-Mail"),
  role:      z.enum(["SUPERADMIN", "VERMITTLER_ADMIN", "PFLEGER", "KUNDE"]),
  tenantId:  z.string().optional(),
  password:  z.string().min(8, "Min. 8 Zeichen").optional().or(z.literal("")),
});

export type UserEditFormData = z.infer<typeof UserEditSchema>;

export async function updateUser(userId: string, data: UserEditFormData) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  const parsed = UserEditSchema.parse(data);

  const emailTaken = await prisma.user.findFirst({
    where: { email: parsed.email, NOT: { id: userId } },
  });
  if (emailTaken) return { error: "Diese E-Mail wird bereits von einem anderen Nutzer verwendet." };

  await prisma.user.update({
    where: { id: userId },
    data: {
      name:  parsed.name,
      email: parsed.email,
      role:  parsed.role,
      ...(parsed.password ? { passwordHash: await hash(parsed.password, 12) } : {}),
    },
  });

  // Sync tenant membership
  if (parsed.tenantId) {
    await prisma.tenantMembership.upsert({
      where:  { userId_tenantId: { userId, tenantId: parsed.tenantId } },
      create: { userId, tenantId: parsed.tenantId, role: parsed.role },
      update: { role: parsed.role },
    });
    // Remove memberships to other tenants
    await prisma.tenantMembership.deleteMany({
      where: { userId, NOT: { tenantId: parsed.tenantId } },
    });
    // Keep role-specific profiles in sync (Vermittler page filters by tenantId)
    if (parsed.role === "PFLEGER") {
      await prisma.caregiverProfile.upsert({
        where:  { userId },
        update: { tenantId: parsed.tenantId },
        create: {
          userId,
          tenantId: parsed.tenantId,
          availability: "FULL_TIME",
        },
      });
    } else if (parsed.role === "KUNDE") {
      await prisma.clientProfile.upsert({
        where:  { userId },
        update: { tenantId: parsed.tenantId },
        create: {
          userId,
          tenantId: parsed.tenantId,
        },
      });
    }
  } else {
    await prisma.tenantMembership.deleteMany({ where: { userId } });
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(userId: string) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };
  if (session.id === userId) return { error: "Du kannst dich nicht selbst löschen." };

  const [matchCount, reviewCount] = await Promise.all([
    prisma.match.count({
      where: {
        OR: [
          { caregiverProfile: { userId } },
          { clientProfile:    { userId } },
        ],
      },
    }),
    prisma.review.count({ where: { authorId: userId } }),
  ]);

  if (matchCount > 0 || reviewCount > 0) {
    return {
      error: `Dieser User hat ${matchCount} Match(es) und ${reviewCount} Bewertung(en) und kann nicht gelöscht werden. Bitte archivieren statt löschen.`,
    };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function archiveUser(userId: string) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  await prisma.caregiverProfile.updateMany({ where: { userId }, data: { isActive: false } });
  await prisma.clientProfile.updateMany({   where: { userId }, data: { isActive: false } });

  revalidatePath("/admin/users");
}

export async function unarchiveUser(userId: string) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  await prisma.caregiverProfile.updateMany({ where: { userId }, data: { isActive: true } });
  await prisma.clientProfile.updateMany({   where: { userId }, data: { isActive: true } });

  revalidatePath("/admin/users");
}
