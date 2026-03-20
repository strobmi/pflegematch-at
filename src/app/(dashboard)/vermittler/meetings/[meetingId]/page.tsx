import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { notFound } from "next/navigation";
import VideoRoom from "@/components/dashboard/VideoRoom";

export default async function VermittlerVideoRoomPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  const session = await requireTenantSession();

  const meeting = await prisma.videoMeeting.findFirst({
    where: { id: meetingId, tenantId: session.tenantId },
    include: {
      match: {
        include: {
          caregiverProfile: { include: { user: true } },
          clientProfile: { include: { user: true } },
        },
      },
    },
  });

  if (!meeting) notFound();

  const hostName = session.tenantName ?? "Vermittler";

  return (
    <div className="h-full">
      <VideoRoom url={meeting.hostRoomUrl ?? meeting.roomUrl} displayName={hostName} />
    </div>
  );
}
