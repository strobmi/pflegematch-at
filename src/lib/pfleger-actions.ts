"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Resend } from "resend";
import {
  RegistrationBaseSchema,
  ProfileUpdateSchema,
  AvailabilitySchema,
  DirectRequestSchema,
} from "@/lib/pfleger-schemas";

export type {
  RegistrationFormData,
  ProfileUpdateData,
  AvailabilityFormData,
  DirectRequestFormData,
} from "@/lib/pfleger-schemas";

const resend = new Resend(process.env.RESEND_API_KEY);

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
          locationCity, locationState, travelRadius, hourlyRate, availability } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "emailTaken" };

  const platformTenant = await getPlatformTenant();

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
      tenantId: platformTenant.id,
      role: "PFLEGER",
    },
  });

  await prisma.caregiverProfile.create({
    data: {
      userId: user.id,
      tenantId: platformTenant.id,
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
    },
  });

  // Welcome email
  try {
    await resend.emails.send({
      from: "pflegematch.at <noreply@pflegematch.at>",
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

// ─────────────────────────────────────────────
// FEATURE 4: DIREKTANFRAGEN
// ─────────────────────────────────────────────

export async function createDirectRequest(
  data: DirectRequestFormData
): Promise<{ error?: string }> {
  const parsed = DirectRequestSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const caregiver = await prisma.caregiverProfile.findFirst({
    where: { id: parsed.data.caregiverProfileId, isPlatformVisible: true, isActive: true },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!caregiver) return { error: "Profil nicht gefunden." };

  const platformTenant = await getPlatformTenant();

  await prisma.matchRequest.create({
    data: {
      tenantId: platformTenant.id,
      targetCaregiverId: caregiver.id,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      careNeedsRaw: parsed.data.careNeedsRaw,
      preferredStart: parsed.data.preferredStart ? new Date(parsed.data.preferredStart) : null,
    },
  });

  // Notify caregiver by email
  try {
    await resend.emails.send({
      from: "pflegematch.at <noreply@pflegematch.at>",
      to: caregiver.user.email,
      subject: `Neue Direktanfrage von ${parsed.data.contactName}`,
      html: `
        <p>Hallo ${caregiver.user.name},</p>
        <p>Sie haben eine neue Direktanfrage erhalten:</p>
        <ul>
          <li><strong>Name:</strong> ${parsed.data.contactName}</li>
          <li><strong>E-Mail:</strong> ${parsed.data.contactEmail}</li>
          ${parsed.data.contactPhone ? `<li><strong>Telefon:</strong> ${parsed.data.contactPhone}</li>` : ""}
          <li><strong>Pflegebedarf:</strong> ${parsed.data.careNeedsRaw}</li>
          ${parsed.data.preferredStart ? `<li><strong>Gewünschter Start:</strong> ${parsed.data.preferredStart}</li>` : ""}
        </ul>
        <p>Melden Sie sich in Ihrem Dashboard an, um die Anfrage zu bearbeiten.</p>
        <p>Ihr pflegematch.at-Team</p>
      `,
    });
  } catch {
    // Non-critical
  }

  return {};
}

export async function markDirectRequestProcessed(
  requestId: string
): Promise<{ error?: string }> {
  const user = await requireSession();
  const profile = await getOwnCaregiverProfile(user.id);

  const request = await prisma.matchRequest.findFirst({
    where: { id: requestId, targetCaregiverId: profile.id },
  });
  if (!request) return { error: "Nicht gefunden." };

  await prisma.matchRequest.update({
    where: { id: requestId },
    data: { isProcessed: true, processedByUserId: user.id },
  });

  revalidatePath("/de/dashboard/pfleger/anfragen");
  revalidatePath("/en/dashboard/pfleger/anfragen");
  revalidatePath("/ro/dashboard/pfleger/anfragen");
  revalidatePath("/hr/dashboard/pfleger/anfragen");
  return {};
}
