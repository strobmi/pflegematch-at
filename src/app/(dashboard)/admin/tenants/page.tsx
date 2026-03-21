import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Vermittler · Admin · pflegematch" };

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: "Aktiv",     className: "bg-[#7B9E7B]/30 text-[#A8C5A8]" },
  PENDING:  { label: "Ausstehend",className: "bg-amber-500/20 text-amber-300" },
  INACTIVE: { label: "Inaktiv",   className: "bg-red-500/20 text-red-300" },
  SUSPENDED:{ label: "Gesperrt",  className: "bg-red-500/20 text-red-300" },
};

export default async function AdminTenantsPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const tenants = await prisma.tenant.findMany({
    where: { isPlatform: false },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { memberships: { where: { role: "VERMITTLER_ADMIN" } }, caregiverProfiles: true, clientProfiles: true, matches: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vermittler</h1>
          <p className="text-sm text-white/50 mt-0.5">{tenants.length} Tenant{tenants.length !== 1 ? "s" : ""} registriert</p>
        </div>
        <Link
          href="/admin/tenants/neu"
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neuer Vermittler
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Firma</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden lg:table-cell">E-Mail</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Teammitglieder</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Pfleger</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Klienten</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">Matches</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {tenants.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-white/30">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Keine Vermittler vorhanden
                </td>
              </tr>
            )}
            {tenants.map((t) => {
              const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.INACTIVE;
              return (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-white/50 hidden lg:table-cell">{t.email ?? "–"}</td>
                  <td className="px-4 py-3 text-white/70 hidden md:table-cell">{t._count.memberships}</td>
                  <td className="px-4 py-3 text-white/70 hidden md:table-cell">{t._count.caregiverProfiles}</td>
                  <td className="px-4 py-3 text-white/70 hidden md:table-cell">{t._count.clientProfiles}</td>
                  <td className="px-4 py-3 text-white/70 hidden md:table-cell">{t._count.matches}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/tenants/${t.id}/bearbeiten`}
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
