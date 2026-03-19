import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { Users, Mail, Clock } from "lucide-react";
import TeamInviteForm from "@/components/dashboard/team/TeamInviteForm";
import TeamMemberRow from "@/components/dashboard/team/TeamMemberRow";
import RevokeInviteButton from "@/components/dashboard/team/RevokeInviteButton";

export const metadata = { title: "Team · pflegematch" };

export default async function TeamPage() {
  const session = await requireTenantSession();

  const [members, pendingInvites] = await Promise.all([
    prisma.tenantMembership.findMany({
      where: { tenantId: session.tenantId, role: "VERMITTLER_ADMIN" },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.inviteToken.findMany({
      where: {
        tenantId: session.tenantId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Team</h1>
          <p className="text-sm text-[#2D2D2D]/50 mt-0.5">
            {members.length} {members.length === 1 ? "Mitglied" : "Mitglieder"}
          </p>
        </div>
      </div>

      {/* Mitglieder */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EAD9C8] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#C06B4A]" />
          <h2 className="text-sm font-semibold text-[#2D2D2D]">Aktive Mitglieder</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAD9C8] bg-[#FDFAF7]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">
                E-Mail
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">
                Mitglied seit
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-[#FDFAF7] transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#2D2D2D]">
                  {m.user.name ?? "–"}
                </td>
                <td className="px-5 py-3.5 text-[#2D2D2D]/65">{m.user.email}</td>
                <td className="px-5 py-3.5 text-[#2D2D2D]/50 text-xs">
                  {m.createdAt.toLocaleDateString("de-AT")}
                </td>
                <td className="px-3 py-3.5 text-right">
                  <TeamMemberRow
                    memberId={m.user.id}
                    memberName={m.user.name ?? m.user.email}
                    isSelf={m.user.id === session.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Einladen */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EAD9C8] flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#C06B4A]" />
          <h2 className="text-sm font-semibold text-[#2D2D2D]">Mitglied einladen</h2>
        </div>
        <div className="px-5 py-5 relative">
          <TeamInviteForm />
        </div>
      </div>

      {/* Offene Einladungen */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAD9C8] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C06B4A]" />
            <h2 className="text-sm font-semibold text-[#2D2D2D]">Ausstehende Einladungen</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EAD9C8] bg-[#FDFAF7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">
                  E-Mail
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">
                  Eingeladen am
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">
                  Läuft ab
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAD9C8]">
              {pendingInvites.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FDFAF7] transition-colors">
                  <td className="px-5 py-3.5 text-[#2D2D2D]/65">{inv.email}</td>
                  <td className="px-5 py-3.5 text-[#2D2D2D]/50 text-xs">
                    {inv.createdAt.toLocaleDateString("de-AT")}
                  </td>
                  <td className="px-5 py-3.5 text-[#2D2D2D]/50 text-xs">
                    {inv.expiresAt.toLocaleDateString("de-AT")}
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <RevokeInviteButton tokenId={inv.id} email={inv.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
