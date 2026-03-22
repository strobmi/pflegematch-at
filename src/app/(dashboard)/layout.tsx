import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import VermittlerSidebar from "@/components/dashboard/layout/VermittlerSidebar";
import AdminSidebar from "@/components/dashboard/layout/AdminSidebar";
import KundeSidebar from "@/components/dashboard/layout/KundeSidebar";
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
      <AdminSidebar userName={name} />
    ) : role === "VERMITTLER_ADMIN" ? (
      <VermittlerSidebar tenantName={tenantName ?? ""} userName={name} />
    ) : role === "KUNDE" ? (
      <KundeSidebar userName={name} />
    ) : null;

  const isAdmin = role === "SUPERADMIN";

  return (
    <div className={`flex h-dvh overflow-hidden ${isAdmin ? "bg-[#1E1E1E]" : "bg-[#FAF6F1]"}`}>
      {sidebar}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isAdmin && role !== "KUNDE" && role !== "VERMITTLER_ADMIN" && (
          <DashboardHeader
            userName={name ?? null}
            tenantName={tenantName}
            profileHref="/vermittler/profil"
          />
        )}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
