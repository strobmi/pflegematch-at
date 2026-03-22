import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { Building2, Users, Link2, Inbox, Tag, UserCog } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Admin · pflegematch" };

export default async function AdminPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const [tenantCount, userCount, matchCount, offeneAnfragen] = await Promise.all([
    prisma.tenant.count({ where: { isPlatform: false } }),
    prisma.user.count(),
    prisma.match.count(),
    prisma.matchRequest.count({
      where: { tenant: { isPlatform: true }, isProcessed: false },
    }),
  ]);

  const recentTenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Vermittler",      value: tenantCount,    icon: Building2, href: "/admin/tenants" },
    { label: "Alle User",       value: userCount,      icon: Users,     href: "/admin/users" },
    { label: "Alle Matches",    value: matchCount,      icon: Link2,     href: "#" },
    { label: "Offene Anfragen", value: offeneAnfragen, icon: Inbox,     href: "/admin/anfragen", highlight: offeneAnfragen > 0 },
    { label: "Preispläne",      value: "→",            icon: Tag,       href: "/admin/pricing-plans" },
    { label: "Mein Profil",     value: "→",            icon: UserCog,   href: "/admin/profil" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Superadmin Dashboard</h1>
        <p className="text-sm text-white/50 mt-0.5">Plattformübersicht</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`border rounded-2xl p-5 flex items-center gap-4 transition-colors ${
              highlight
                ? "bg-[#C06B4A]/20 border-[#C06B4A]/40 hover:bg-[#C06B4A]/30"
                : "bg-white/10 border-white/10 hover:bg-white/15"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${highlight ? "bg-[#C06B4A]/30" : "bg-white/10"}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/50">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Vermittler</h2>
          <Link href="/admin/tenants" className="text-sm text-white/60 hover:text-white">
            Alle ansehen →
          </Link>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Firma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide hidden md:table-cell">E-Mail</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recentTenants.map((t) => (
                <tr key={t.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                  <td className="px-4 py-3 text-white/50 hidden md:table-cell">{t.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.status === "ACTIVE" ? "bg-[#7B9E7B]/30 text-[#A8C5A8]" :
                      t.status === "PENDING" ? "bg-amber-500/20 text-amber-300" :
                      "bg-red-500/20 text-red-300"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
