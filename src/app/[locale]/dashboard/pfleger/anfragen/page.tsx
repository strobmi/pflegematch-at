import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import DirectRequestCard from "@/components/dashboard/pfleger/DirectRequestCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.nav" });
  return { title: `${t("requests")} · pflegematch` };
}

export default async function AnfragenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.requests" });

  const caregiverProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!caregiverProfile) redirect(`/${locale}/dashboard/pfleger`);

  const requests = await prisma.matchRequest.findMany({
    where: { targetCaregiverId: caregiverProfile.id },
    orderBy: [{ isProcessed: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#2D2D2D]">{t("title")}</h1>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-sm text-[#2D2D2D]/40">
          {t("noRequests")}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <DirectRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
