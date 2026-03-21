import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "lucide-react";
import ScheduleMeetingForm from "@/components/dashboard/matches/ScheduleMeetingForm";
import { scheduleVideoMeetingAction } from "@/app/(dashboard)/vermittler/matches/video-actions";

export default async function NeuVideoTerminPage({
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
    },
  });

  if (!match) notFound();

  const caregiverName =
    match.caregiverProfile.user.name ?? match.caregiverProfile.user.email;
  const clientName =
    match.clientProfile.user.name ?? match.clientProfile.user.email;
  const matchLabel = `${clientName} ↔ ${caregiverName}`;

  // Load preferred slots from MatchRequest
  const matchRequest = await prisma.matchRequest.findFirst({
    where: { clientProfileId: match.clientProfileId, isProcessed: true },
    select: { careNeedsRaw: true },
  });

  type Wunschtermin = { dateTime: string; durationMin: 30 | 60 };
  const wunschtermine: Wunschtermin[] = [];
  if (matchRequest?.careNeedsRaw) {
    try {
      const raw = JSON.parse(matchRequest.careNeedsRaw) as { wunschtermine?: Wunschtermin[] };
      const now = new Date();
      for (const s of raw.wunschtermine ?? []) {
        if (s.dateTime && new Date(s.dateTime) > now) wunschtermine.push(s);
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#2D2D2D]">
          Neuen Videotermin planen
        </h1>
        <p className="text-sm text-[#2D2D2D]/60 mt-0.5">{matchLabel}</p>
      </div>

      {wunschtermine.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
          <p className="text-sm font-semibold text-[#2D2D2D] mb-1">Wunschtermine Kennenlernen</p>
          <p className="text-xs text-[#2D2D2D]/50 mb-3">Klicken Sie auf einen Termin, um ihn direkt zu erstellen.</p>
          <div className="space-y-2">
            {wunschtermine.map((slot, i) => {
              const scheduleSlot = scheduleVideoMeetingAction.bind(null, matchId, slot.dateTime, slot.durationMin);
              return (
                <form key={i} action={scheduleSlot}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-between gap-3 bg-[#FAF6F1] hover:bg-[#FDF5F0] border border-[#EAD9C8] hover:border-[#C06B4A]/40 rounded-xl px-4 py-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-sm text-[#2D2D2D]">
                      <Calendar className="w-4 h-4 text-[#C06B4A] shrink-0" />
                      {format(new Date(slot.dateTime), "EE, dd.MM.yyyy · HH:mm 'Uhr'", { locale: de })}
                      {" "}({slot.durationMin} Min.)
                    </div>
                    <span className="text-xs font-medium text-[#C06B4A] bg-[#C06B4A]/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
                      Termin erstellen →
                    </span>
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      )}

      <ScheduleMeetingForm matchId={matchId} matchLabel={matchLabel} />

      <Link
        href={`/vermittler/matches/${matchId}/video`}
        className="inline-flex text-sm text-[#2D2D2D]/50 hover:text-[#2D2D2D] transition"
      >
        ← Zurück zu den Terminen
      </Link>
    </div>
  );
}
