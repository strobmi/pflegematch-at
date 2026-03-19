import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import VermittlerSidebar from "@/components/dashboard/layout/VermittlerSidebar";
import AdminSidebar from "@/components/dashboard/layout/AdminSidebar";
import DashboardHeader from "@/components/dashboard/layout/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, tenantName, name } = session.user;

  const sidebar =
    role === "SUPERADMIN" ? (
      <AdminSidebar />
    ) : role === "VERMITTLER_ADMIN" ? (
      <VermittlerSidebar tenantName={tenantName ?? ""} />
    ) : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF6F1]">
      {sidebar}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={name ?? null} tenantName={tenantName} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
