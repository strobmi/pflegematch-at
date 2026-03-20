"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { sendWelcomeToken } from "@/lib/sendWelcomeToken";
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
  addressStreet: z.string().optional(),
  addressCountry: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankAccountHolder: z.string().optional(),
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

  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      name: parsed.name,
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
      addressStreet: parsed.addressStreet,
      addressCountry: parsed.addressCountry,
      iban: parsed.iban,
      bic: parsed.bic,
      bankAccountHolder: parsed.bankAccountHolder,
      emergencyContactName: parsed.emergencyContactName,
      emergencyContactPhone: parsed.emergencyContactPhone,
      isActive: parsed.isActive,
    },
  });

  await sendWelcomeToken(parsed.email, parsed.name);

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
      addressStreet: parsed.addressStreet,
      addressCountry: parsed.addressCountry,
      iban: parsed.iban,
      bic: parsed.bic,
      bankAccountHolder: parsed.bankAccountHolder,
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

export async function setKlientActive(profileId: string, isActive: boolean) {
  const session = await requireTenantSession();
  const profile = await prisma.clientProfile.findFirst({
    where: { id: profileId, tenantId: session.tenantId },
  });
  if (!profile) return { error: "Nicht gefunden." };

  await prisma.clientProfile.update({
    where: { id: profileId },
    data: { isActive },
  });

  revalidatePath("/vermittler/klienten");
}
