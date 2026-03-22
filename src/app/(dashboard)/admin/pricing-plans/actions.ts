"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PlanSchema = z.object({
  name:       z.string().min(2, "Min. 2 Zeichen"),
  slug:       z.string().min(2).regex(/^[a-z0-9-]+$/),
  monthlyFee: z.coerce.number().min(0, "Min. 0"),
  matchFee:   z.coerce.number().min(0, "Min. 0"),
  sortOrder:  z.coerce.number().int().min(0).default(0),
});

export type PlanFormData = z.infer<typeof PlanSchema>;

export async function updatePricingPlan(planId: string, data: PlanFormData) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") return { error: "Keine Berechtigung." };

  const parsed = PlanSchema.parse(data);

  await prisma.pricingPlan.update({
    where: { id: planId },
    data: {
      name:       parsed.name,
      monthlyFee: parsed.monthlyFee,
      matchFee:   parsed.matchFee,
      sortOrder:  parsed.sortOrder,
    },
  });

  revalidatePath("/admin/pricing-plans");
  return { success: true };
}
