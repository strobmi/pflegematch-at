import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import AvailabilityCalendar from "@/components/dashboard/pfleger/AvailabilityCalendar";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.nav" });
  return { title: `${t("availability")} · pflegematch` };
}

export default async function VerfuegbarkeitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const caregiverProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!caregiverProfile) redirect(`/${locale}/dashboard/pfleger`);

  const entries = await prisma.caregiverAvailability.findMany({
    where: { caregiverProfileId: caregiverProfile.id },
    orderBy: { startDate: "desc" },
  });

  return <AvailabilityCalendar entries={entries} />;
}
