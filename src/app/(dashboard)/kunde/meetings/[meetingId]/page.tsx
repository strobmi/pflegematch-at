import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import VideoRoom from "@/components/dashboard/VideoRoom";

export default async function KundeVideoRoomPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!clientProfile) notFound();

  const meeting = await prisma.videoMeeting.findFirst({
    where: {
      id: meetingId,
      match: { clientProfileId: clientProfile.id },
      status: "SCHEDULED",
    },
  });

  if (!meeting) notFound();

  const displayName = session.user.name ?? session.user.email ?? "Kund:in";

  return (
    <div className="h-full">
      {/* roomUrl is intentionally used here, never hostRoomUrl */}
      <VideoRoom url={meeting.roomUrl} displayName={displayName} />
    </div>
  );
}
