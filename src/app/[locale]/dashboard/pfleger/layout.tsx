import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PflegerSidebar from "@/components/dashboard/layout/PflegerSidebar";

export default async function PflegerDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "PFLEGER") redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF6F1]">
      <PflegerSidebar locale={locale} userName={session.user.name ?? null} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
