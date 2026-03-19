import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UpcomingMeetingsList from "@/components/dashboard/meetings/UpcomingMeetingsList";
import { Video, ArrowRight } from "lucide-react";

export const metadata = { title: "Mein Bereich · pflegematch" };

export default async function KundeDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  const upcomingMeetings = clientProfile
    ? await prisma.videoMeeting.findMany({
        where: {
          match: { clientProfileId: clientProfile.id },
          status: "SCHEDULED",
          scheduledAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">
          Willkommen, {session.user.name}
        </h1>
        <p className="text-[#2D2D2D]/55">
          Hier sehen Sie Ihre Pflegematches und Anfragen.
        </p>
      </div>

      {upcomingMeetings.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#C06B4A]" />
              <h2 className="text-sm font-semibold text-[#2D2D2D]">
                Bevorstehende Videotermine
              </h2>
            </div>
            <Link
              href="/kunde/meetings"
              className="flex items-center gap-1 text-xs text-[#C06B4A] hover:underline"
            >
              Alle anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <UpcomingMeetingsList meetings={upcomingMeetings} role="KUNDE" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-[#2D2D2D]/40">
          Sobald Ihr Vermittler einen Match für Sie erstellt hat, erscheint er hier.
        </div>
      )}
    </div>
  );
}
