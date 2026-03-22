"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  RegistrationBaseSchema,
  ProfileUpdateSchema,
  AvailabilitySchema,
  type RegistrationFormData,
  type ProfileUpdateData,
  type AvailabilityFormData,
} from "@/lib/pfleger-schemas";

export type {
  RegistrationFormData,
  ProfileUpdateData,
  AvailabilityFormData,
} from "@/lib/pfleger-schemas";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Server-side only: full registration schema with password-match check
const RegistrationSchema = RegistrationBaseSchema.refine(
  (d) => d.password === d.passwordConfirm,
  { message: "Passwörter stimmen nicht überein", path: ["passwordConfirm"] }
);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

async function getPlatformTenant() {
  const tenant = await prisma.tenant.findFirst({ where: { isPlatform: true } });
  if (!tenant) throw new Error("Platform-Tenant nicht konfiguriert.");
  return tenant;
}

async function getOwnCaregiverProfile(userId: string) {
  const profile = await prisma.caregiverProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Kein Pflegeprofil gefunden.");
  return profile;
}

// ─────────────────────────────────────────────
// FEATURE 1: SELBST-REGISTRIERUNG
// ─────────────────────────────────────────────

export async function registerFreelancePfleger(
  data: RegistrationFormData
): Promise<{ error?: string }> {
  const parsed = RegistrationSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const { name, email, password, bio, qualifications, skills, languages,
          locationCity, locationState, travelRadius, hourlyRate, availability,
          addressStreet, addressPostal, addressCity, addressCountry, referredBy } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "emailTaken" };

  const platformTenant = await getPlatformTenant();

  // Auto-assign to the first active Vermittler tenant (single-Vermittler setup).
  // To switch to manual admin assignment later: replace `assignTenant` with `platformTenant`.
  const assignTenant = (await prisma.tenant.findFirst({
    where: { isPlatform: false, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  })) ?? platformTenant;

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hash(password, 12),
      role: "PFLEGER",
    },
  });

  await prisma.tenantMembership.create({
    data: {
      userId: user.id,
      tenantId: assignTenant.id,
      role: "PFLEGER",
    },
  });

  await prisma.caregiverProfile.create({
    data: {
      userId: user.id,
      tenantId: assignTenant.id,
      type: "FREELANCE",
      bio,
      qualifications,
      skills,
      languages,
      availability,
      locationCity,
      locationState,
      travelRadius,
      hourlyRate: hourlyRate ? hourlyRate.toString() : undefined,
      isActive: true,
      isPlatformVisible: false,
      addressStreet,
      addressPostal,
      addressCity,
      addressCountry,
      referredBy,
    },
  });

  // Welcome email
  try {
    await resend?.emails.send({
      from: "pflegematch.at <noreply@mail.pflegematch.at>",
      to: email,
      subject: "Willkommen bei pflegematch.at",
      html: `<p>Hallo ${name},</p><p>Ihr Profil wurde erfolgreich erstellt. Melden Sie sich jetzt an und vervollständigen Sie Ihr Profil.</p><p>Ihr pflegematch.at-Team</p>`,
    });
  } catch {
    // Non-critical – registration still succeeded
  }

  return {};
}

// ─────────────────────────────────────────────
// FEATURE 2: EIGENES PROFIL AKTUALISIEREN
// ─────────────────────────────────────────────

export async function updateOwnProfile(
  data: ProfileUpdateData
): Promise<{ error?: string }> {
  const user = await requireSession();
  const parsed = ProfileUpdateSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const profile = await getOwnCaregiverProfile(user.id);

  await prisma.caregiverProfile.update({
    where: { id: profile.id },
    data: {
      bio: parsed.data.bio,
      qualifications: parsed.data.qualifications,
      skills: parsed.data.skills,
      languages: parsed.data.languages,
      availability: parsed.data.availability,
      locationCity: parsed.data.locationCity,
      locationState: parsed.data.locationState,
      travelRadius: parsed.data.travelRadius,
      hourlyRate: parsed.data.hourlyRate ? parsed.data.hourlyRate.toString() : null,
      isActive: parsed.data.isActive,
      isPlatformVisible: parsed.data.isPlatformVisible,
      addressStreet: parsed.data.addressStreet,
      addressPostal: parsed.data.addressPostal,
      addressCity: parsed.data.addressCity,
      addressCountry: parsed.data.addressCountry,
      iban: parsed.data.iban,
      bic: parsed.data.bic,
      bankAccountHolder: parsed.data.bankAccountHolder,
      referredBy: parsed.data.referredBy,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/de/dashboard/pfleger/profil");
  revalidatePath("/en/dashboard/pfleger/profil");
  revalidatePath("/ro/dashboard/pfleger/profil");
  revalidatePath("/hr/dashboard/pfleger/profil");
  return {};
}

// ─────────────────────────────────────────────
// FEATURE 3: VERFÜGBARKEIT
// ─────────────────────────────────────────────

export async function createAvailability(
  data: AvailabilityFormData
): Promise<{ error?: string; id?: string }> {
  const user = await requireSession();
  const parsed = AvailabilitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const profile = await getOwnCaregiverProfile(user.id);

  const entry = await prisma.caregiverAvailability.create({
    data: {
      caregiverProfileId: profile.id,
      tenantId: profile.tenantId,
      status: parsed.data.status,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/de/dashboard/pfleger/verfuegbarkeit");
  revalidatePath("/en/dashboard/pfleger/verfuegbarkeit");
  revalidatePath("/ro/dashboard/pfleger/verfuegbarkeit");
  revalidatePath("/hr/dashboard/pfleger/verfuegbarkeit");
  return { id: entry.id };
}

export async function planAvailabilityBlocks(
  firstFreeBlockStart: Date,
  blocks = 3
): Promise<{ error?: string }> {
  const user = await requireSession();
  const profile = await getOwnCaregiverProfile(user.id);

  const CYCLE_DAYS = 28; // 14 Tage frei + 14 Tage im Einsatz
  const BLOCK_DAYS = 14;

  const entries = Array.from({ length: blocks }, (_, i) => {
    const start = new Date(firstFreeBlockStart);
    start.setDate(start.getDate() + i * CYCLE_DAYS);
    const end = new Date(start);
    end.setDate(end.getDate() + BLOCK_DAYS);
    return {
      caregiverProfileId: profile.id,
      tenantId: profile.tenantId,
      status: "AVAILABLE" as const,
      startDate: start,
      endDate: end,
    };
  });

  await prisma.caregiverAvailability.createMany({ data: entries });

  for (const locale of ["de", "en", "ro", "hr"]) {
    revalidatePath(`/${locale}/dashboard/pfleger/verfuegbarkeit`);
    revalidatePath(`/${locale}/dashboard/pfleger`);
  }
  return {};
}

export async function deleteAvailability(
  id: string
): Promise<{ error?: string }> {
  const user = await requireSession();
  const profile = await getOwnCaregiverProfile(user.id);

  const entry = await prisma.caregiverAvailability.findFirst({
    where: { id, caregiverProfileId: profile.id },
  });
  if (!entry) return { error: "Nicht gefunden." };

  await prisma.caregiverAvailability.delete({ where: { id } });

  revalidatePath("/de/dashboard/pfleger/verfuegbarkeit");
  revalidatePath("/en/dashboard/pfleger/verfuegbarkeit");
  revalidatePath("/ro/dashboard/pfleger/verfuegbarkeit");
  revalidatePath("/hr/dashboard/pfleger/verfuegbarkeit");
  return {};
}

