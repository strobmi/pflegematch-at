"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateAnfrageSchema = z.object({
  contactName:   z.string().min(1, "Name erforderlich"),
  contactEmail:  z.string().email("Gültige E-Mail erforderlich"),
  contactPhone:  z.string().optional(),
  fuerWen:       z.string().optional(),
  betreuungsart: z.string().optional(),
  pflegestufe:   z.string().optional(),
  mobilitaet:    z.string().optional(),
  demenz:        z.string().optional(),
  unterkunft:    z.string().optional(),
  startZeit:     z.string().optional(),
  dauer:         z.string().optional(),
  ort:           z.string().optional(),
  sprachen:      z.array(z.object({ lang: z.string(), level: z.string() })).optional(),
  notes:         z.string().optional(),
});

export type CreateAnfrageData = z.infer<typeof CreateAnfrageSchema>;

const PFLEGESTUFE_ENUM: Record<string, string> = {
  stufe_1: "STUFE_1", stufe_2: "STUFE_2",
  stufe_3: "STUFE_3", stufe_45: "STUFE_4",
};

export async function createAnfrage(data: CreateAnfrageData) {
  const session = await requireTenantSession();
  const parsed = CreateAnfrageSchema.parse(data);

  const careNeedsRaw = JSON.stringify({
    fuerWen:       parsed.fuerWen,
    betreuungsart: parsed.betreuungsart,
    pflegestufe:   parsed.pflegestufe,
    mobilitaet:    parsed.mobilitaet,
    demenz:        parsed.demenz,
    unterkunft:    parsed.unterkunft,
    startZeit:     parsed.startZeit,
    dauer:         parsed.dauer,
    ort:           parsed.ort,
    sprachen:      parsed.sprachen ?? [],
    name:          parsed.contactName,
    email:         parsed.contactEmail,
    telefon:       parsed.contactPhone,
  });

  await prisma.matchRequest.create({
    data: {
      tenantId:        session.tenantId,
      contactName:     parsed.contactName,
      contactEmail:    parsed.contactEmail,
      contactPhone:    parsed.contactPhone || null,
      pflegegeldStufe: (PFLEGESTUFE_ENUM[parsed.pflegestufe ?? ""] as never) ?? null,
      careNeedsRaw,
      notes:           parsed.notes || null,
      isProcessed:     false,
    },
  });

  revalidatePath("/vermittler/anfragen");
  redirect("/vermittler/anfragen");
}

export async function markAnfrageProcessed(
  requestId: string,
  closedReason: "KEIN_INTERESSE" | "ANDERWEITIG_VERSORGT" | "KEIN_PFLEGER" | "NICHT_ERREICHBAR" | "SONSTIGES",
  closedNote?: string,
) {
  const session = await requireTenantSession();

  const req = await prisma.matchRequest.findFirst({
    where: { id: requestId, tenantId: session.tenantId },
  });
  if (!req) return { error: "Nicht gefunden." };

  await prisma.matchRequest.update({
    where: { id: requestId },
    data: {
      isProcessed: true,
      processedByUserId: session.id,
      closedReason,
      closedNote: closedNote?.trim() || null,
    },
  });

  revalidatePath("/vermittler/anfragen");
}

export async function reopenAnfrage(requestId: string) {
  const session = await requireTenantSession();

  const req = await prisma.matchRequest.findFirst({
    where: { id: requestId, tenantId: session.tenantId },
  });
  if (!req) return { error: "Nicht gefunden." };
  if (req.clientProfileId) return { error: "Leads mit einem Match können nicht wieder geöffnet werden." };

  await prisma.matchRequest.update({
    where: { id: requestId },
    data: { isProcessed: false, processedByUserId: null, closedReason: null, closedNote: null },
  });

  revalidatePath("/vermittler/anfragen");
}

export async function createMatchFromAnfrage(
  requestId: string,
  caregiverProfileId: string
): Promise<{ error?: string }> {
  try {
    const session = await requireTenantSession();

    // 1. Load the MatchRequest — must belong to this tenant
    const req = await prisma.matchRequest.findFirst({
      where: { id: requestId, tenantId: session.tenantId },
    });
    if (!req) return { error: "Anfrage nicht gefunden." };
    if (!req.contactEmail) return { error: "Anfrage hat keine E-Mail-Adresse." };

    // 2. Verify the CaregiverProfile belongs to this tenant
    const caregiver = await prisma.caregiverProfile.findFirst({
      where: { id: caregiverProfileId, tenantId: session.tenantId },
    });
    if (!caregiver) return { error: "Pflegekraft nicht gefunden." };

    // 3. Find or create the Kunde User
    let user = await prisma.user.findUnique({ where: { email: req.contactEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: req.contactEmail,
          name:  req.contactName ?? undefined,
          role:  "KUNDE",
        },
      });
    }

    // 4. Add TenantMembership if not already present
    await prisma.tenantMembership.upsert({
      where:  { userId_tenantId: { userId: user.id, tenantId: session.tenantId } },
      update: {},
      create: { userId: user.id, tenantId: session.tenantId, role: "KUNDE" },
    });

    // 5. Find or create ClientProfile (userId is unique — one profile per user)
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
    });
    if (!clientProfile) {
      const raw = req.careNeedsRaw ? JSON.parse(req.careNeedsRaw) : {};
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId:              user.id,
          tenantId:            session.tenantId,
          pflegegeldStufe:     req.pflegegeldStufe ?? undefined,
          preferredLanguages:  Array.isArray(raw.sprachen)
            ? (raw.sprachen as Array<{ lang: string }>).map((s) => s.lang)
            : [],
          locationCity:        (raw.ort as string) || undefined,
          careNeedsDescription: req.notes || undefined,
        },
      });
    }

    // 6. Create the Match
    await prisma.match.create({
      data: {
        tenantId:           session.tenantId,
        caregiverProfileId: caregiverProfileId,
        clientProfileId:    clientProfile.id,
        status:             "PROPOSED",
      },
    });

    // 7. Mark the MatchRequest as processed and link the client profile
    await prisma.matchRequest.update({
      where: { id: requestId },
      data:  { isProcessed: true, clientProfileId: clientProfile.id, processedByUserId: session.id },
    });

    revalidatePath("/vermittler/anfragen");
    revalidatePath("/vermittler/matches");
    return {};
  } catch (err) {
    console.error("createMatchFromAnfrage error:", err);
    return { error: err instanceof Error ? err.message : "Unbekannter Fehler" };
  }
}
