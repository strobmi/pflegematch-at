import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Handshake } from "lucide-react";
import KundeMatchCard from "@/components/dashboard/matches/KundeMatchCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meine Matches · pflegematch" };

export default async function KundeMatchesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!clientProfile) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-[#2D2D2D]">Meine Matches</h1>
        <p className="text-sm text-[#2D2D2D]/60">Kein Kundenprofil gefunden.</p>
      </div>
    );
  }

  const matches = await prisma.match.findMany({
    where: {
      clientProfileId: clientProfile.id,
      status: { in: ["PENDING", "ACCEPTED", "ACTIVE"] },
    },
    include: {
      caregiverProfile: {
        select: {
          id: true,
          locationCity: true,
          user: { select: { name: true, email: true } },
        },
      },
      meetingProposals: {
        orderBy: { proposedAt: "asc" },
      },
      videoMeetings: {
        orderBy: { scheduledAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-3xl p-8">
      <div className="flex items-center gap-3">
        <Handshake className="w-5 h-5 text-[#C06B4A]" />
        <div>
          <h1 className="text-xl font-semibold text-[#2D2D2D]">Meine Matches</h1>
          <p className="text-sm text-[#2D2D2D]/55">Vorgeschlagene Pflegekräfte und Terminvereinbarungen.</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-sm text-[#2D2D2D]/40">
          Sobald Ihr Vermittler eine Pflegekraft für Sie vorschlägt, erscheint sie hier.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const m = match as any;
            return (
            <KundeMatchCard
              key={match.id}
              match={{
                id:                match.id,
                status:            match.status,
                score:             match.score != null ? Number(match.score) : null,
                clientConfirmed:   m.clientConfirmed   ?? null,
                clientConfirmedAt: m.clientConfirmedAt ?? null,
                caregiverProfile:  match.caregiverProfile,
                videoMeetings:     match.videoMeetings.map((v) => ({
                  id:          v.id,
                  scheduledAt: v.scheduledAt,
                  durationMin: v.durationMin,
                  roomUrl:     v.roomUrl,
                  status:      v.status,
                })),
              }}
            />
            );
          })}
        </div>
      )}
    </div>
  );
}
