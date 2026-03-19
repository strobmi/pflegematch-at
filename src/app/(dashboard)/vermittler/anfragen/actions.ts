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

export async function markAnfrageProcessed(requestId: string) {
  const session = await requireTenantSession();

  // Verify the request belongs to this tenant
  const req = await prisma.matchRequest.findFirst({
    where: { id: requestId, tenantId: session.tenantId },
  });
  if (!req) return { error: "Nicht gefunden." };

  await prisma.matchRequest.update({
    where: { id: requestId },
    data: { isProcessed: true },
  });

  revalidatePath("/vermittler/anfragen");
}
