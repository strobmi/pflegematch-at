import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Alle User · Admin · pflegematch" };

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  SUPERADMIN:      { label: "Superadmin",  className: "bg-[#C06B4A]/30 text-[#E09070]" },
  VERMITTLER_ADMIN:{ label: "Vermittler",  className: "bg-[#7B9E7B]/30 text-[#A8C5A8]" },
  PFLEGER:         { label: "Pfleger",     className: "bg-blue-500/20 text-blue-300" },
  KUNDE:           { label: "Kunde",       className: "bg-purple-500/20 text-purple-300" },
};

export default async function AdminUsersPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships: { include: { tenant: { select: { name: true } } } },
      caregiverProfile: { select: { isActive: true } },
      clientProfile: { select: { isActive: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alle User</h1>
        <p className="text-sm text-white/50 mt-0.5">{users.length} registriert</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">E-Mail</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Typ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">Herkunft</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Keine User vorhanden
                </td>
              </tr>
            )}
            {users.map((u) => {
              const cfg = ROLE_CONFIG[u.role] ?? { label: u.role, className: "bg-white/10 text-white/50" };
              const isActive = u.caregiverProfile?.isActive ?? u.clientProfile?.isActive ?? null;
              return (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{u.name ?? "–"}</td>
                  <td className="px-4 py-3 text-white/50 hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {isActive === false ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Archiviert</span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">Aktiv</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/50 hidden lg:table-cell">
                    {u.memberships[0]?.tenant.name ?? "–"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${u.id}/bearbeiten`}
                      className="text-xs text-white/40 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
