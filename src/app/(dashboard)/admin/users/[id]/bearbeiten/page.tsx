import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import UserEditForm from "@/components/dashboard/admin/UserEditForm";
import { updateUser, deleteUser } from "../../actions";

export const metadata = { title: "User bearbeiten · Admin · pflegematch" };

export default async function UserBearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const { id } = await params;

  const [user, tenants] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: { memberships: { select: { tenantId: true } } },
    }),
    prisma.tenant.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  const defaultValues = {
    name:     user.name ?? "",
    email:    user.email,
    role:     user.role,
    tenantId: user.memberships[0]?.tenantId ?? "",
    password: "",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/users"
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">User bearbeiten</h1>
          <p className="text-sm text-white/40 mt-0.5">{user.email}</p>
        </div>
      </div>

      <UserEditForm
        defaultValues={defaultValues}
        tenants={tenants}
        userId={id}
        isSelf={session.id === id}
        onSubmit={updateUser}
        onDelete={deleteUser}
      />
    </div>
  );
}
