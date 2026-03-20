"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().min(2, "Min. 2 Zeichen"),
  careNeedsDescription: z.string().optional(),
  pflegegeldStufe: z.enum(["STUFE_1","STUFE_2","STUFE_3","STUFE_4","STUFE_5"]).optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredLanguages: z.array(z.string()).default([]),
  locationPostal: z.string().optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  addressStreet: z.string().optional(),
  addressCountry: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export type KundeProfileData = z.infer<typeof ProfileSchema>;

export async function updateOwnClientProfile(data: KundeProfileData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = ProfileSchema.parse(data);

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { error: "Profil nicht gefunden." };

  await prisma.clientProfile.update({
    where: { id: profile.id },
    data: {
      careNeedsDescription: parsed.careNeedsDescription,
      pflegegeldStufe: parsed.pflegegeldStufe,
      requiredSkills: parsed.requiredSkills,
      preferredLanguages: parsed.preferredLanguages,
      locationPostal: parsed.locationPostal,
      locationCity: parsed.locationCity,
      locationState: parsed.locationState,
      addressStreet: parsed.addressStreet,
      addressCountry: parsed.addressCountry,
      iban: parsed.iban,
      bic: parsed.bic,
      bankAccountHolder: parsed.bankAccountHolder,
      emergencyContactName: parsed.emergencyContactName,
      emergencyContactPhone: parsed.emergencyContactPhone,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.name },
  });

  revalidatePath("/kunde/einstellungen");
  return {};
}
