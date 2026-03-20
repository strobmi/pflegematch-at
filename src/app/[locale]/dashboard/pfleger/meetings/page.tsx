import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import UpcomingMeetingsList from "@/components/dashboard/meetings/UpcomingMeetingsList";
import { Video } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.nav" });
  return { title: `${t("meetings")} · pflegematch` };
}

export default async function PflegerMeetingsPage({
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

  const meetings = await prisma.videoMeeting.findMany({
    where: {
      match: { caregiverProfileId: caregiverProfile.id },
      status: { not: "CANCELLED" },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.meetings" });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Video className="w-5 h-5 text-[#C06B4A]" />
        <h1 className="text-xl font-semibold text-[#2D2D2D]">
          {t("title")}
        </h1>
      </div>

      <UpcomingMeetingsList meetings={meetings} role="PFLEGER" locale={locale} />
    </div>
  );
}
