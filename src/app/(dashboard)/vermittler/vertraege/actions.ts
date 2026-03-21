"use server";

import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateContractSchema = z.object({
  matchId:                 z.string().min(1),
  contractNumber:          z.string().optional(),
  contractNumberCaregiver: z.string().optional(),
  contractNumberClient:    z.string().optional(),
  startDate:               z.string().min(1, "Startdatum erforderlich"),
  endDate:          z.string().optional(),
  noticePeriodDays: z.coerce.number().int().min(0).default(14),
  notes:            z.string().optional(),
  matchFeeAmount:   z.coerce.number().min(0).optional(),
  monthlyFeeAmount: z.coerce.number().min(0).optional(),
});

export type CreateContractData = z.infer<typeof CreateContractSchema>;

export async function createContract(data: CreateContractData) {
  const session = await requireTenantSession();
  const parsed = CreateContractSchema.parse(data);

  // Verify match belongs to this tenant
  const match = await prisma.match.findFirst({
    where: { id: parsed.matchId, tenantId: session.tenantId },
    select: {
      id: true,
      status: true,
      caregiverProfileId: true,
      clientProfileId: true,
      contract: { select: { id: true } },
    },
  });

  if (!match) return { error: "Match nicht gefunden." };
  if (match.contract) return { error: "Für dieses Match existiert bereits ein Vertrag." };

  await prisma.$transaction(async (tx) => {
    await tx.contract.create({
      data: {
        matchId:                 parsed.matchId,
        contractNumber:          parsed.contractNumber          || null,
        contractNumberCaregiver: parsed.contractNumberCaregiver || null,
        contractNumberClient:    parsed.contractNumberClient    || null,
        tenantId:                session.tenantId,
        caregiverProfileId: match.caregiverProfileId,
        clientProfileId:    match.clientProfileId,
        startDate:          new Date(parsed.startDate),
        endDate:            parsed.endDate ? new Date(parsed.endDate) : null,
        noticePeriodDays:   parsed.noticePeriodDays,
        notes:              parsed.notes || null,
        matchFeeAmount:     parsed.matchFeeAmount ?? null,
        monthlyFeeAmount:   parsed.monthlyFeeAmount ?? null,
      },
    });

    await tx.match.update({
      where: { id: parsed.matchId },
      data: {
        status:          "ACTIVE",
        provisionAmount: parsed.monthlyFeeAmount ?? null,
        matchFeeAmount:  parsed.matchFeeAmount ?? null,
      },
    });
  });

  revalidatePath("/vermittler/matches");
  revalidatePath("/vermittler/vertraege");
  redirect("/vermittler/vertraege");
}

const UpdateContractSchema = z.object({
  contractNumber:          z.string().optional(),
  contractNumberCaregiver: z.string().optional(),
  contractNumberClient:    z.string().optional(),
  startDate:               z.string().min(1),
  endDate:                 z.string().optional(),
  noticePeriodDays:        z.coerce.number().int().min(0),
  matchFeeAmount:          z.coerce.number().min(0).optional(),
  monthlyFeeAmount:        z.coerce.number().min(0).optional(),
  notes:                   z.string().optional(),
  status:                  z.enum(["ACTIVE", "TERMINATED", "EXPIRED"]),
});

export type UpdateContractData = z.infer<typeof UpdateContractSchema>;

export async function updateContract(contractId: string, data: UpdateContractData) {
  const session = await requireTenantSession();
  const parsed = UpdateContractSchema.parse(data);

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, tenantId: session.tenantId },
    select: { id: true, matchId: true, status: true },
  });
  if (!contract) return { error: "Vertrag nicht gefunden." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.contract.update({
        where: { id: contractId },
        data: {
          contractNumber:          parsed.contractNumber          || null,
          contractNumberCaregiver: parsed.contractNumberCaregiver || null,
          contractNumberClient:    parsed.contractNumberClient    || null,
          startDate:               new Date(parsed.startDate),
          endDate:                 parsed.endDate ? new Date(parsed.endDate) : null,
          noticePeriodDays:        parsed.noticePeriodDays,
          matchFeeAmount:          parsed.matchFeeAmount ?? null,
          monthlyFeeAmount:        parsed.monthlyFeeAmount ?? null,
          notes:                   parsed.notes || null,
          status:                  parsed.status,
        },
      });

      // Cascade: contract ended → match completed
      if (
        parsed.status !== contract.status &&
        (parsed.status === "TERMINATED" || parsed.status === "EXPIRED")
      ) {
        await tx.match.update({
          where: { id: contract.matchId },
          data: { status: "COMPLETED" },
        });
      }
    });
  } catch {
    return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  revalidatePath("/vermittler/vertraege");
  revalidatePath("/vermittler/matches");
}
