import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Handshake } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import PflegerMatchCard from "@/components/dashboard/matches/PflegerMatchCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.matches" });
  return { title: `${t("title")} · pflegematch` };
}

export default async function PflegerMatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.matches" });

  const caregiverProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!caregiverProfile) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-[#2D2D2D]">{t("title")}</h1>
        <p className="text-sm text-[#2D2D2D]/60">{t("noMatches")}</p>
      </div>
    );
  }

  const matches = await prisma.match.findMany({
    where: {
      caregiverProfileId: caregiverProfile.id,
      status: { in: ["PROPOSED", "PENDING", "ACCEPTED"] },
    },
    include: {
      clientProfile: {
        select: {
          id: true,
          pflegegeldStufe: true,
          locationCity: true,
          user: { select: { name: true, email: true } },
        },
      },
      meetingProposals: {
        orderBy: { proposedAt: "asc" },
      },
      videoMeetings: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Handshake className="w-5 h-5 text-[#C06B4A]" />
        <div>
          <h1 className="text-xl font-semibold text-[#2D2D2D]">{t("title")}</h1>
          <p className="text-sm text-[#2D2D2D]/55">{t("subtitle")}</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-sm text-[#2D2D2D]/40">
          {t("noMatches")}
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <PflegerMatchCard
              key={match.id}
              match={match}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
