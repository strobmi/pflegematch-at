import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Handshake } from "lucide-react";
import PflegerMatchCard, { type Wunschtermin } from "@/components/dashboard/matches/PflegerMatchCard";

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
      videoMeetings: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Load preferred slots from MatchRequests for each client
  const clientProfileIds = matches.map((m) => m.clientProfileId);
  const matchRequests = clientProfileIds.length
    ? await prisma.matchRequest.findMany({
        where: { clientProfileId: { in: clientProfileIds }, isProcessed: true },
        select: { clientProfileId: true, careNeedsRaw: true },
      })
    : [];

  // Build map: clientProfileId → wunschtermine[]
  const slotsMap = new Map<string, Wunschtermin[]>();
  for (const req of matchRequests) {
    if (!req.clientProfileId || !req.careNeedsRaw) continue;
    try {
      const raw = JSON.parse(req.careNeedsRaw) as { wunschtermine?: Wunschtermin[] };
      const slots = (raw.wunschtermine ?? []).filter(
        (s) => s.dateTime && new Date(s.dateTime) > new Date()
      );
      if (slots.length) slotsMap.set(req.clientProfileId, slots);
    } catch {
      // ignore malformed JSON
    }
  }

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
              wunschtermine={slotsMap.get(match.clientProfileId) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
