import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CaregiverPublicProfile from "@/components/public/CaregiverPublicProfile";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const profile = await prisma.caregiverProfile.findFirst({
    where: { id, isPlatformVisible: true, isActive: true },
    include: { user: { select: { name: true } } },
  });
  const t = await getTranslations({ locale, namespace: "publicProfile" });
  if (!profile) return { title: `${t("notVisible")} · pflegematch` };
  return { title: `${profile.user.name} · pflegematch` };
}

export default async function PublicCaregiverProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const profile = await prisma.caregiverProfile.findFirst({
    where: { id, isPlatformVisible: true, isActive: true },
    include: {
      user: { select: { name: true, avatarUrl: true } },
    },
  });

  if (!profile) notFound();

  // Reviews use targetId (CaregiverProfile.id) — no direct relation on model
  const reviews = await prisma.review.findMany({
    where: { targetId: id, targetType: "CAREGIVER", isPublic: true },
    select: { id: true, rating: true, comment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Most recent active availability status
  const latestAvailability = await prisma.caregiverAvailability.findFirst({
    where: { caregiverProfileId: id, startDate: { lte: new Date() } },
    orderBy: { startDate: "desc" },
  });

  const currentStatus = latestAvailability?.status ?? "AVAILABLE";

  return (
    <CaregiverPublicProfile
      profile={{ ...profile, reviews }}
      currentStatus={currentStatus}
      locale={locale}
    />
  );
}
