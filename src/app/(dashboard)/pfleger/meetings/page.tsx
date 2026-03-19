import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UpcomingMeetingsList from "@/components/dashboard/meetings/UpcomingMeetingsList";
import { Video } from "lucide-react";

export default async function PflegerMeetingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const caregiverProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!caregiverProfile) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-[#2D2D2D]">
          Meine Videotermine
        </h1>
        <p className="text-sm text-[#2D2D2D]/60">
          Kein Pflegerprofil gefunden.
        </p>
      </div>
    );
  }

  const meetings = await prisma.videoMeeting.findMany({
    where: {
      match: { caregiverProfileId: caregiverProfile.id },
      status: { not: "CANCELLED" },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Video className="w-5 h-5 text-[#C06B4A]" />
        <h1 className="text-xl font-semibold text-[#2D2D2D]">
          Meine Videotermine
        </h1>
      </div>

      <UpcomingMeetingsList meetings={meetings} role="PFLEGER" />
    </div>
  );
}
