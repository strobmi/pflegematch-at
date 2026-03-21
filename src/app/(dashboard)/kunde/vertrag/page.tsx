import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileText, CheckCircle, Hash, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mein Vertrag · pflegematch" };

const STATUS_CONFIG = {
  ACTIVE:     { label: "Aktiv",      className: "bg-green-100 text-green-700" },
  TERMINATED: { label: "Gekündigt",  className: "bg-red-100 text-red-600" },
  EXPIRED:    { label: "Abgelaufen", className: "bg-gray-100 text-gray-500" },
} as const;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#2D2D2D]/50 mb-0.5">{label}</p>
      <p className="font-medium text-[#2D2D2D]">{value}</p>
    </div>
  );
}

export default async function KundeVertragPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!clientProfile) {
    return (
      <div className="space-y-4 p-8">
        <h1 className="text-xl font-semibold text-[#2D2D2D]">Mein Vertrag</h1>
        <p className="text-sm text-[#2D2D2D]/60">Kein Kundenprofil gefunden.</p>
      </div>
    );
  }

  const contracts = await prisma.contract.findMany({
    where: { clientProfileId: clientProfile.id },
    include: {
      tenant:          { select: { name: true } },
      caregiverProfile: { select: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active  = contracts.find((c) => c.status === "ACTIVE");
  const history = contracts.filter((c) => c.status !== "ACTIVE");

  return (
    <div className="max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-[#C06B4A]" />
        <div>
          <h1 className="text-xl font-semibold text-[#2D2D2D]">Mein Vertrag</h1>
          <p className="text-sm text-[#2D2D2D]/55">Ihre aktuelle Vermittlungsvereinbarung.</p>
        </div>
      </div>

      {!active && history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-sm text-[#2D2D2D]/40">
          Noch kein aktiver Vertrag vorhanden. Ihr Vermittler wird Sie informieren, sobald ein Vertrag aufgesetzt wurde.
        </div>
      ) : active ? (
        <>
          {/* Status banner */}
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl px-5 py-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Vertrag aktiv – Ihr Vermittler hat den Vertrag aufgesetzt.</span>
            {(active.contractNumberClient ?? active.contractNumber) && (
              <span className="flex items-center gap-1 text-xs text-green-700/70 font-mono">
                <Hash className="w-3 h-3" />
                {active.contractNumberClient ?? active.contractNumber}
              </span>
            )}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              Aktiv
            </span>
          </div>

          {/* Parteien */}
          <div className="bg-[#FAF6F1] rounded-2xl border border-[#EAD9C8] px-5 py-4">
            <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide mb-3">Parteien</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Pflegekraft" value={active.caregiverProfile.user.name ?? active.caregiverProfile.user.email} />
              <Field label="Vermittler" value={active.tenant.name} />
            </div>
          </div>

          {/* Laufzeit */}
          <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-4">
            <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Laufzeit</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Startdatum" value={format(new Date(active.startDate), "dd. MMMM yyyy", { locale: de })} />
              <Field label="Enddatum" value={active.endDate ? format(new Date(active.endDate), "dd. MMMM yyyy", { locale: de }) : "Unbefristet"} />
              <Field label="Kündigungsfrist" value={`${active.noticePeriodDays} Tage`} />
              <Field label="Erstellt am" value={format(new Date(active.createdAt), "dd. MMMM yyyy", { locale: de })} />
              <Field label="Referenznummer" value={active.contractNumberClient ?? active.contractNumber ?? "–"} />
            </div>
          </div>
        </>
      ) : null}

      {/* Vertragshistorie */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#EAD9C8]">
            <Clock className="w-4 h-4 text-[#2D2D2D]/40" />
            <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Vertragshistorie</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Nr.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Pflegekraft</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Start</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAD9C8]">
              {history.map((c) => {
                const cfg = STATUS_CONFIG[c.status];
                return (
                  <tr key={c.id} className="hover:bg-[#FAF6F1] transition-colors">
                    <td className="px-4 py-3 text-[#2D2D2D]/60 font-mono text-xs">
                      {c.contractNumberClient ?? c.contractNumber ?? `…${c.id.slice(-6)}`}
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70 text-xs">
                      {c.caregiverProfile.user.name ?? c.caregiverProfile.user.email}
                    </td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70 text-xs hidden md:table-cell">
                      {format(new Date(c.startDate), "dd. MMM yyyy", { locale: de })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
