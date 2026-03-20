import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { User, Calendar, ArrowRight, Video } from "lucide-react";
import UpcomingMeetingsList from "@/components/dashboard/meetings/UpcomingMeetingsList";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pfleger" });
  return { title: `${t("nav.overview")} · pflegematch` };
}

export default async function PflegerOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations({ locale, namespace: "dashboard.pfleger" });

  const caregiverProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  const upcomingMeetings = await (caregiverProfile
    ? prisma.videoMeeting.findMany({
        where: {
          match: { caregiverProfileId: caregiverProfile.id },
          status: "SCHEDULED",
          scheduledAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      })
    : Promise.resolve([]));

  const base = `/${locale}/dashboard/pfleger`;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">
          {t("welcome", { name: session.user.name ?? "" })}
        </h1>
        <p className="text-[#2D2D2D]/55">{t("subtitle")}</p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href={`${base}/profil`}
          className="bg-white rounded-2xl border border-[#EAD9C8] p-5 hover:border-[#C06B4A]/40 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#C06B4A]/10 flex items-center justify-center mb-3 group-hover:bg-[#C06B4A]/20 transition-colors">
            <User className="w-4.5 h-4.5 text-[#C06B4A]" />
          </div>
          <p className="font-semibold text-sm text-[#2D2D2D]">{t("nav.profile")}</p>
          <div className="flex items-center gap-1 text-xs text-[#2D2D2D]/40 mt-0.5">
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href={`${base}/verfuegbarkeit`}
          className="bg-white rounded-2xl border border-[#EAD9C8] p-5 hover:border-[#C06B4A]/40 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#7B9E7B]/10 flex items-center justify-center mb-3 group-hover:bg-[#7B9E7B]/20 transition-colors">
            <Calendar className="w-4.5 h-4.5 text-[#7B9E7B]" />
          </div>
          <p className="font-semibold text-sm text-[#2D2D2D]">{t("nav.availability")}</p>
          <div className="flex items-center gap-1 text-xs text-[#2D2D2D]/40 mt-0.5">
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link
          href={`${base}/meetings`}
          className="bg-white rounded-2xl border border-[#EAD9C8] p-5 hover:border-[#C06B4A]/40 hover:shadow-md transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <Video className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <p className="font-semibold text-sm text-[#2D2D2D]">{t("nav.meetings")}</p>
          <div className="flex items-center gap-1 text-xs text-[#2D2D2D]/40 mt-0.5">
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      {/* Upcoming video meetings */}
      {upcomingMeetings.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#C06B4A]" />
            <h2 className="text-sm font-semibold text-[#2D2D2D]">Bevorstehende Videotermine</h2>
          </div>
          <UpcomingMeetingsList meetings={upcomingMeetings} role="PFLEGER" locale={locale} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-sm text-[#2D2D2D]/40">
          {t("noMatches")}
        </div>
      )}
    </div>
  );
}
