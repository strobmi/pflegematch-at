import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Users, HeartHandshake, Link2, Inbox, FileText } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

export const metadata = { title: "Übersicht · pflegematch" };

export default async function VermittlerOverviewPage() {
  const session = await requireTenantSession();
  const tenantId = session.tenantId;

  const [pflegerCount, klientenCount, matchesCount, anfragenCount, recentMatches, contractReadyMatches] =
    await Promise.all([
      prisma.caregiverProfile.count({ where: { tenantId, isActive: true } }),
      prisma.clientProfile.count({ where: { tenantId, isActive: true } }),
      prisma.match.count({ where: { tenantId, status: { in: ["ACTIVE", "ACCEPTED"] } } }),
      prisma.matchRequest.count({ where: { tenantId, isProcessed: false } }),
      prisma.match.findMany({
        where: { tenantId },
        include: {
          caregiverProfile: { include: { user: { select: { name: true } } } },
          clientProfile:    { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.match.findMany({
        where: {
          tenantId,
          caregiverConfirmed: true,
          clientConfirmed: true,
          status: { notIn: ["ACTIVE", "COMPLETED", "CANCELLED"] },
          contract: null,
        },
        include: {
          caregiverProfile: { select: { user: { select: { name: true } } } },
          clientProfile:    { select: { user: { select: { name: true } } } },
        },
      }),
    ]);

  const stats = [
    { label: "Aktive Pflegekräfte", value: pflegerCount,  icon: Users,          color: "#C06B4A", bg: "#F5EDE3" },
    { label: "Aktive Klienten",     value: klientenCount, icon: HeartHandshake,  color: "#7B9E7B", bg: "#F0F7F0" },
    { label: "Laufende Matches",    value: matchesCount,  icon: Link2,           color: "#A05438", bg: "#F5EDE3" },
    { label: "Offene Anfragen",     value: anfragenCount, icon: Inbox,           color: "#5A7A5A", bg: "#F0F7F0" },
  ];

  const STATUS_LABELS: Record<string, string> = {
    PROPOSED: "Vorgeschlagen", PENDING: "Ausstehend", ACCEPTED: "Akzeptiert",
    ACTIVE: "Aktiv", COMPLETED: "Abgeschlossen", CANCELLED: "Storniert",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Übersicht</h1>
        <p className="text-sm text-[#2D2D2D]/50 mt-0.5">{session.tenantName}</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-[#EAD9C8] p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2D2D2D]">{value}</p>
              <p className="text-xs text-[#2D2D2D]/50 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contract-ready table */}
      {contractReadyMatches.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-green-200">
            <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                Bereit für Vertrag
                <span className="ml-2 text-xs font-medium bg-green-600 text-white px-2 py-0.5 rounded-full">
                  {contractReadyMatches.length}
                </span>
              </p>
              <p className="text-xs text-green-700/60">Beide Parteien haben das Kennenlerngespräch bestätigt.</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-green-200 bg-green-100/50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-green-800/60 uppercase tracking-wide">Pflegekraft</th>
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-green-800/60 uppercase tracking-wide">Klient</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-green-200">
              {contractReadyMatches.map((m) => (
                <tr key={m.id} className="hover:bg-green-100/40 transition-colors">
                  <td className="px-5 py-3 font-medium text-green-900">{m.caregiverProfile.user.name}</td>
                  <td className="px-5 py-3 text-green-800/70">{m.clientProfile.user.name}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/vermittler/vertraege/neu/${m.id}`}
                      className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <FileText className="w-3 h-3" />
                      Vertrag anlegen
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent matches */}
      <div>
        <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">Letzte Matches</h2>
        {recentMatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-[#2D2D2D]/40 text-sm">
            Noch keine Matches — erstelle das erste Match unter &quot;Matches&quot;.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Pflegekraft</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Klient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Erstellt</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAD9C8]">
                {recentMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF6F1]">
                    <td className="px-4 py-3 font-medium text-[#2D2D2D]">{m.caregiverProfile.user.name}</td>
                    <td className="px-4 py-3 text-[#2D2D2D]/70">{m.clientProfile.user.name}</td>
                    <td className="px-4 py-3 text-[#2D2D2D]/50 text-xs hidden md:table-cell">
                      {format(new Date(m.createdAt), "dd. MMM yyyy", { locale: de })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F5EDE3] text-[#C06B4A] px-2 py-0.5 rounded-full font-medium">
                        {STATUS_LABELS[m.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
