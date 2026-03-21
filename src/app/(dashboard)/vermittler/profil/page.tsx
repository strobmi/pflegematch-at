import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { User, Building2, Mail, Phone, MapPin, Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import EmailChangeForm from "@/components/dashboard/EmailChangeForm";
import TeamInviteForm from "@/components/dashboard/team/TeamInviteForm";
import TeamMemberRow from "@/components/dashboard/team/TeamMemberRow";
import RevokeInviteButton from "@/components/dashboard/team/RevokeInviteButton";

export const metadata = { title: "Mein Profil · pflegematch" };

export default async function VermittlerProfilPage() {
  const session = await requireTenantSession();

  const [user, tenant, members, pendingInvites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { name: true, slug: true, email: true, phone: true, address: true, createdAt: true },
    }),
    prisma.tenantMembership.findMany({
      where: { tenantId: session.tenantId, role: "VERMITTLER_ADMIN" },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.inviteToken.findMany({
      where: { tenantId: session.tenantId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user || !tenant) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Mein Profil</h1>
        <p className="text-sm text-[#2D2D2D]/50 mt-0.5">Kontoinformationen</p>
      </div>

      {/* Organisation */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-[#C06B4A]" />
          <h2 className="text-sm font-semibold text-[#2D2D2D]/70 uppercase tracking-wide">Organisation</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
            <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Name</span>
            <span className="text-[#2D2D2D] font-medium">{tenant.name}</span>
          </div>
          {tenant.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
              <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">E-Mail</span>
              <span className="text-[#2D2D2D] font-medium">{tenant.email}</span>
            </div>
          )}
          {tenant.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
              <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Telefon</span>
              <span className="text-[#2D2D2D] font-medium">{tenant.phone}</span>
            </div>
          )}
          {tenant.address && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
              <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Adresse</span>
              <span className="text-[#2D2D2D] font-medium">{tenant.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* User card */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#C06B4A] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-[#2D2D2D]">{user.name ?? "–"}</p>
            <p className="text-sm text-[#2D2D2D]/50">Vermittler-Admin</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
            <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">E-Mail</span>
            <span className="text-[#2D2D2D] font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
            <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Dabei seit</span>
            <span className="text-[#2D2D2D] font-medium">
              {format(new Date(user.createdAt), "dd. MMMM yyyy", { locale: de })}
            </span>
          </div>
        </div>
      </div>

      {/* E-Mail ändern */}
      <EmailChangeForm currentEmail={user.email} />

      {/* Vermittler Team */}
      <div>
        <h2 className="text-lg font-bold text-[#2D2D2D]">Vermittler Team</h2>
        <p className="text-sm text-[#2D2D2D]/50 mt-0.5">
          {members.length} {members.length === 1 ? "Mitglied" : "Mitglieder"}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EAD9C8] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#C06B4A]" />
          <h3 className="text-sm font-semibold text-[#2D2D2D]">Aktive Mitglieder</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAD9C8] bg-[#FDFAF7]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">E-Mail</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">Mitglied seit</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-[#FDFAF7] transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#2D2D2D]">{m.user.name ?? "–"}</td>
                <td className="px-5 py-3.5 text-[#2D2D2D]/65">{m.user.email}</td>
                <td className="px-5 py-3.5 text-[#2D2D2D]/50 text-xs">{m.createdAt.toLocaleDateString("de-AT")}</td>
                <td className="px-3 py-3.5 text-right">
                  <TeamMemberRow memberId={m.user.id} memberName={m.user.name ?? m.user.email} isSelf={m.user.id === session.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EAD9C8] flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#C06B4A]" />
          <h3 className="text-sm font-semibold text-[#2D2D2D]">Mitglied einladen</h3>
        </div>
        <div className="px-5 py-5 relative">
          <TeamInviteForm />
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAD9C8] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C06B4A]" />
            <h3 className="text-sm font-semibold text-[#2D2D2D]">Ausstehende Einladungen</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EAD9C8] bg-[#FDFAF7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">E-Mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">Eingeladen am</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wider">Läuft ab</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAD9C8]">
              {pendingInvites.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FDFAF7] transition-colors">
                  <td className="px-5 py-3.5 text-[#2D2D2D]/65">{inv.email}</td>
                  <td className="px-5 py-3.5 text-[#2D2D2D]/50 text-xs">{inv.createdAt.toLocaleDateString("de-AT")}</td>
                  <td className="px-5 py-3.5 text-[#2D2D2D]/50 text-xs">{inv.expiresAt.toLocaleDateString("de-AT")}</td>
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
