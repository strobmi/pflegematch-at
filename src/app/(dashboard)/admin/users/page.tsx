import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import AdminUsersTable from "@/components/dashboard/admin/AdminUsersTable";

export const metadata = { title: "Alle User · Admin · pflegematch" };

export default async function AdminUsersPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const raw = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships:     { include: { tenant: { select: { name: true } } } },
      caregiverProfile:{ select: { isActive: true } },
      clientProfile:   { select: { isActive: true } },
    },
  });

  const users = raw.map((u) => ({
    id:          u.id,
    name:        u.name,
    email:       u.email,
    role:        u.role,
    createdAt:   u.createdAt.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }),
    lastLoginAt: u.lastLoginAt
      ? u.lastLoginAt.toLocaleString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : null,
    isActive:    u.caregiverProfile?.isActive ?? u.clientProfile?.isActive ?? null,
    tenant:      u.memberships[0]?.tenant.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Alle User</h1>
        <p className="text-sm text-white/50 mt-0.5">{users.length} registriert</p>
      </div>

      <AdminUsersTable users={users} />
    </div>
  );
}
