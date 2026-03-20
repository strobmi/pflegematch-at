import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import PflegerProfileForm from "@/components/dashboard/pfleger/PflegerProfileForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.profile" });
  return { title: `${t("title")} · pflegematch` };
}

export default async function PflegerProfilPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const t = await getTranslations({ locale, namespace: "dashboard.pfleger.profile" });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile || !user) {
    redirect(`/${locale}/dashboard/pfleger`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">{t("title")}</h1>
      </div>
      <PflegerProfileForm profile={profile} user={user} locale={locale} />
    </div>
  );
}
