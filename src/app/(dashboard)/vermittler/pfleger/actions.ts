"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const PflegerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().optional(),
  qualifications: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  availability: z.enum(["FULL_TIME", "PART_TIME", "HOURLY", "LIVE_IN"]),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  travelRadius: z.coerce.number().optional(),
  hourlyRate: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  addressStreet: z.string().optional(),
  addressPostal: z.string().optional(),
  addressCity: z.string().optional(),
  addressCountry: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  referredBy: z.string().optional(),
});

export type PflegerFormData = z.infer<typeof PflegerSchema>;

export async function createPfleger(data: PflegerFormData) {
  const session = await requireTenantSession();

  const parsed = PflegerSchema.parse(data);

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });
  if (existing) {
    return { error: "Ein Nutzer mit dieser E-Mail existiert bereits." };
  }

  const tempPassword = Math.random().toString(36).slice(-10);

  const user = await prisma.user.create({
    data: {
      email: parsed.email,
      name: parsed.name,
      passwordHash: await hash(tempPassword, 12),
      role: "PFLEGER",
    },
  });

  await prisma.tenantMembership.create({
    data: {
      userId: user.id,
      tenantId: session.tenantId,
      role: "PFLEGER",
    },
  });

  await prisma.caregiverProfile.create({
    data: {
      userId: user.id,
      tenantId: session.tenantId,
      bio: parsed.bio,
      qualifications: parsed.qualifications,
      skills: parsed.skills,
      languages: parsed.languages,
      availability: parsed.availability,
      locationCity: parsed.locationCity,
      locationState: parsed.locationState,
      travelRadius: parsed.travelRadius,
      hourlyRate: parsed.hourlyRate ? parsed.hourlyRate.toString() : undefined,
      isActive: parsed.isActive,
      addressStreet: parsed.addressStreet,
      addressPostal: parsed.addressPostal,
      addressCity: parsed.addressCity,
      addressCountry: parsed.addressCountry,
      iban: parsed.iban,
      bic: parsed.bic,
      bankAccountHolder: parsed.bankAccountHolder,
      referredBy: parsed.referredBy,
    },
  });

  revalidatePath("/vermittler/pfleger");
  redirect("/vermittler/pfleger");
}

export async function updatePfleger(profileId: string, data: PflegerFormData) {
  const session = await requireTenantSession();
  const parsed = PflegerSchema.parse(data);

  const profile = await prisma.caregiverProfile.findFirst({
    where: { id: profileId, tenantId: session.tenantId },
  });
  if (!profile) return { error: "Nicht gefunden." };

  await prisma.caregiverProfile.update({
    where: { id: profileId },
    data: {
      bio: parsed.bio,
      qualifications: parsed.qualifications,
      skills: parsed.skills,
      languages: parsed.languages,
      availability: parsed.availability,
      locationCity: parsed.locationCity,
      locationState: parsed.locationState,
      travelRadius: parsed.travelRadius,
      hourlyRate: parsed.hourlyRate ? parsed.hourlyRate.toString() : null,
      isActive: parsed.isActive,
      addressStreet: parsed.addressStreet,
      addressPostal: parsed.addressPostal,
      addressCity: parsed.addressCity,
      addressCountry: parsed.addressCountry,
      iban: parsed.iban,
      bic: parsed.bic,
      bankAccountHolder: parsed.bankAccountHolder,
      referredBy: parsed.referredBy,
    },
  });

  await prisma.user.update({
    where: { id: profile.userId },
    data: { name: parsed.name },
  });

  revalidatePath("/vermittler/pfleger");
  redirect("/vermittler/pfleger");
}

export async function deletePfleger(profileId: string) {
  const session = await requireTenantSession();

  const profile = await prisma.caregiverProfile.findFirst({
    where: { id: profileId, tenantId: session.tenantId },
  });
  if (!profile) return { error: "Nicht gefunden." };

  await prisma.caregiverProfile.delete({ where: { id: profileId } });

  revalidatePath("/vermittler/pfleger");
}
