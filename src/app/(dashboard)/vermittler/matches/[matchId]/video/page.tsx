import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Video,
  Plus,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import { cancelVideoMeetingAction } from "../../video-actions";
import VermittlerProposalSection from "@/components/dashboard/matches/VermittlerProposalSection";
import type { MeetingStatus } from "@prisma/client";

const STATUS_LABELS: Record<MeetingStatus, string> = {
  SCHEDULED: "Geplant",
  CANCELLED: "Abgesagt",
  COMPLETED: "Abgeschlossen",
};

const STATUS_COLORS: Record<MeetingStatus, string> = {
  SCHEDULED: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  COMPLETED: "bg-gray-50 text-gray-500 border-gray-200",
};

export default async function MatchVideoPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const session = await requireTenantSession();

  const match = await prisma.match.findFirst({
    where: { id: matchId, tenantId: session.tenantId },
    include: {
      caregiverProfile: { include: { user: true } },
      clientProfile: { include: { user: true } },
      videoMeetings: { orderBy: { scheduledAt: "asc" } },
      meetingProposals: { orderBy: { proposedAt: "asc" } },
    },
  });

  if (!match) notFound();

  const caregiverName =
    match.caregiverProfile.user.name ?? match.caregiverProfile.user.email;
  const clientName =
    match.clientProfile.user.name ?? match.clientProfile.user.email;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2D2D2D]">
            Videotermine
          </h1>
          <p className="text-sm text-[#2D2D2D]/60 mt-0.5">
            {clientName} ↔ {caregiverName}
          </p>
        </div>
        <Link
          href={`/vermittler/matches/${matchId}/video/neu`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C06B4A] text-white text-sm font-medium hover:bg-[#A05438] transition"
        >
          <Plus className="w-4 h-4" />
          Neuer Termin
        </Link>
      </div>

      <VermittlerProposalSection
        matchId={matchId}
        proposals={match.meetingProposals}
      />

      {match.videoMeetings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-10 text-center">
          <Video className="w-8 h-8 text-[#2D2D2D]/20 mx-auto mb-2" />
          <p className="text-sm text-[#2D2D2D]/50">
            Noch keine Videotermine geplant.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {match.videoMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-2xl border border-[#EAD9C8] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="w-4 h-4 text-[#C06B4A] shrink-0" />
                    <span className="font-semibold text-sm text-[#2D2D2D]">
                      {format(
                        meeting.scheduledAt,
                        "EEEE, dd. MMMM yyyy · HH:mm",
                        { locale: de }
                      )}{" "}
                      Uhr
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-[#2D2D2D]/50">
                      <Clock className="w-3 h-3" />
                      {meeting.durationMin} min
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[meeting.status]}`}
                    >
                      {STATUS_LABELS[meeting.status]}
                    </span>
                  </div>
                  {meeting.notes && (
                    <p className="mt-2 text-xs text-[#2D2D2D]/60">
                      {meeting.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {meeting.status === "SCHEDULED" && (
                    <>
                      <Link
                        href={`/vermittler/meetings/${meeting.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7B9E7B] text-white text-xs font-medium hover:bg-[#5F7F5F] transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Beitreten
                      </Link>
                      <a
                        href={meeting.hostRoomUrl ?? meeting.roomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-[#2D2D2D]/40 hover:text-[#2D2D2D] rounded-lg transition"
                        title="In neuem Tab öffnen"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <form
                        action={cancelVideoMeetingAction.bind(null, meeting.id)}
                      >
                        <button
                          type="submit"
                          title="Termin absagen"
                          className="p-1.5 text-[#2D2D2D]/40 hover:text-red-500 rounded-lg transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/vermittler/matches"
        className="inline-flex text-sm text-[#2D2D2D]/50 hover:text-[#2D2D2D] transition"
      >
        ← Zurück zur Matchliste
      </Link>
    </div>
  );
}
