"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const KlientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  careNeedsDescription: z.string().optional(),
  pflegegeldStufe: z.enum(["STUFE_1","STUFE_2","STUFE_3","STUFE_4","STUFE_5"]).optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredLanguages: z.array(z.string()).default([]),
  preferredSchedule: z.enum(["FULL_TIME","PART_TIME","HOURLY","LIVE_IN"]).optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  locationPostal: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type KlientFormData = z.infer<typeof KlientSchema>;

export async function createKlient(data: KlientFormData) {
  const session = await requireTenantSession();
  const parsed = KlientSchema.parse(data);

  const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existing) return { error: "Ein Nutzer mit dieser E-Mail existiert bereits." };

  const tempPassword = Math.random().toString(36).slice(-10);

  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      name: parsed.name,
      passwordHash: await hash(tempPassword, 12),
      role: "KUNDE",
    },
  });

  await prisma.tenantMembership.create({
    data: { userId: user.id, tenantId: session.tenantId, role: "KUNDE" },
  });

  await prisma.clientProfile.create({
    data: {
      userId: user.id,
      tenantId: session.tenantId,
      careNeedsDescription: parsed.careNeedsDescription,
      pflegegeldStufe: parsed.pflegegeldStufe,
      requiredSkills: parsed.requiredSkills,
      preferredLanguages: parsed.preferredLanguages,
      preferredSchedule: parsed.preferredSchedule,
      locationCity: parsed.locationCity,
      locationState: parsed.locationState,
      locationPostal: parsed.locationPostal,
      emergencyContactName: parsed.emergencyContactName,
      emergencyContactPhone: parsed.emergencyContactPhone,
      isActive: parsed.isActive,
    },
  });

  revalidatePath("/vermittler/klienten");
  redirect("/vermittler/klienten");
}

export async function updateKlient(profileId: string, data: KlientFormData) {
  const session = await requireTenantSession();
  const parsed = KlientSchema.parse(data);

  const profile = await prisma.clientProfile.findFirst({
    where: { id: profileId, tenantId: session.tenantId },
  });
  if (!profile) return { error: "Nicht gefunden." };

  await prisma.clientProfile.update({
    where: { id: profileId },
    data: {
      careNeedsDescription: parsed.careNeedsDescription,
      pflegegeldStufe: parsed.pflegegeldStufe,
      requiredSkills: parsed.requiredSkills,
      preferredLanguages: parsed.preferredLanguages,
      preferredSchedule: parsed.preferredSchedule,
      locationCity: parsed.locationCity,
      locationState: parsed.locationState,
      locationPostal: parsed.locationPostal,
      emergencyContactName: parsed.emergencyContactName,
      emergencyContactPhone: parsed.emergencyContactPhone,
      isActive: parsed.isActive,
    },
  });

  await prisma.user.update({
    where: { id: profile.userId },
    data: { name: parsed.name },
  });

  revalidatePath("/vermittler/klienten");
  redirect("/vermittler/klienten");
}

export async function deleteKlient(profileId: string) {
  const session = await requireTenantSession();
  const profile = await prisma.clientProfile.findFirst({
    where: { id: profileId, tenantId: session.tenantId },
  });
  if (!profile) return { error: "Nicht gefunden." };
  await prisma.clientProfile.delete({ where: { id: profileId } });
  revalidatePath("/vermittler/klienten");
}
