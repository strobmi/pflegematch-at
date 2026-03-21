"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { z } from "zod";

const VermittlerSchema = z.object({
  // Tenant
  tenantName:    z.string().min(2, "Min. 2 Zeichen"),
  tenantSlug:    z.string().min(2, "Min. 2 Zeichen").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  tenantEmail:   z.string().email("Ungültige E-Mail"),
  tenantPhone:   z.string().optional(),
  tenantAddress: z.string().optional(),
  // Admin-User
  userName:      z.string().min(2, "Min. 2 Zeichen"),
  userEmail:     z.string().email("Ungültige E-Mail"),
  userPassword:  z.string().min(8, "Min. 8 Zeichen"),
});

export type VermittlerFormData = z.infer<typeof VermittlerSchema>;

export async function createVermittler(data: VermittlerFormData) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  const parsed = VermittlerSchema.parse(data);

  const slugTaken = await prisma.tenant.findUnique({ where: { slug: parsed.tenantSlug } });
  if (slugTaken) return { error: "Dieser Slug ist bereits vergeben." };

  const emailTaken = await prisma.user.findUnique({ where: { email: parsed.userEmail } });
  if (emailTaken) return { error: "Ein Nutzer mit dieser E-Mail existiert bereits." };

  const tenant = await prisma.tenant.create({
    data: {
      name:    parsed.tenantName,
      slug:    parsed.tenantSlug,
      email:   parsed.tenantEmail,
      phone:   parsed.tenantPhone,
      address: parsed.tenantAddress,
      status:  "ACTIVE",
    },
  });

  const user = await prisma.user.create({
    data: {
      name:         parsed.userName,
      email:        parsed.userEmail,
      passwordHash: await hash(parsed.userPassword, 12),
      role:         "VERMITTLER_ADMIN",
    },
  });

  await prisma.tenantMembership.create({
    data: {
      userId:   user.id,
      tenantId: tenant.id,
      role:     "VERMITTLER_ADMIN",
    },
  });

  revalidatePath("/admin/tenants");
  redirect("/admin/tenants");
}

const TenantEditSchema = z.object({
  tenantName:        z.string().min(2, "Min. 2 Zeichen"),
  tenantSlug:        z.string().min(2, "Min. 2 Zeichen").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  tenantEmail:       z.string().email("Ungültige E-Mail"),
  tenantPhone:       z.string().optional(),
  tenantAddress:     z.string().optional(),
  status:            z.enum(["ACTIVE", "PENDING", "SUSPENDED"]),
  defaultMatchFee:   z.coerce.number().min(0).optional().nullable(),
  defaultMonthlyFee: z.coerce.number().min(0).optional().nullable(),
});

export type TenantEditFormData = z.infer<typeof TenantEditSchema>;

export async function updateTenant(tenantId: string, data: TenantEditFormData) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  const parsed = TenantEditSchema.parse(data);

  const slugTaken = await prisma.tenant.findFirst({
    where: { slug: parsed.tenantSlug, NOT: { id: tenantId } },
  });
  if (slugTaken) return { error: "Dieser Slug ist bereits vergeben." };

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      name:             parsed.tenantName,
      slug:             parsed.tenantSlug,
      email:            parsed.tenantEmail,
      phone:            parsed.tenantPhone,
      address:          parsed.tenantAddress,
      status:            parsed.status,
      defaultMatchFee:   parsed.defaultMatchFee ?? null,
      defaultMonthlyFee: parsed.defaultMonthlyFee ?? null,
    },
  });

  revalidatePath("/admin/tenants");
  redirect("/admin/tenants");
}

export async function deleteTenant(tenantId: string) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  await prisma.tenant.delete({ where: { id: tenantId } });

  revalidatePath("/admin/tenants");
}

// ─────────────────────────────────────────────
// PFLEGER-ZUORDNUNG
// ─────────────────────────────────────────────

async function getPlatformTenant() {
  const t = await prisma.tenant.findFirst({ where: { isPlatform: true } });
  if (!t) throw new Error("Platform-Tenant nicht konfiguriert.");
  return t;
}

export async function assignPflegerToTenant(
  pflegerUserId: string,
  targetTenantId: string
): Promise<{ error?: string }> {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  const user = await prisma.user.findUnique({ where: { id: pflegerUserId } });
  if (!user || user.role !== "PFLEGER") return { error: "Pfleger nicht gefunden." };

  await prisma.tenantMembership.deleteMany({ where: { userId: pflegerUserId } });
  await prisma.tenantMembership.create({
    data: { userId: pflegerUserId, tenantId: targetTenantId, role: "PFLEGER" },
  });
  await prisma.caregiverProfile.updateMany({
    where: { userId: pflegerUserId },
    data: { tenantId: targetTenantId },
  });

  revalidatePath(`/admin/tenants/${targetTenantId}/pfleger`);
  return {};
}

export async function unassignPflegerFromTenant(
  pflegerUserId: string,
  currentTenantId: string
): Promise<{ error?: string }> {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  const platformTenant = await getPlatformTenant();

  await prisma.tenantMembership.deleteMany({ where: { userId: pflegerUserId } });
  await prisma.tenantMembership.create({
    data: { userId: pflegerUserId, tenantId: platformTenant.id, role: "PFLEGER" },
  });
  await prisma.caregiverProfile.updateMany({
    where: { userId: pflegerUserId },
    data: { tenantId: platformTenant.id },
  });

  revalidatePath(`/admin/tenants/${currentTenantId}/pfleger`);
  return {};
}
