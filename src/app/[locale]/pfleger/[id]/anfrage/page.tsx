import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import Link from "next/link";
import DirectRequestForm from "@/components/public/DirectRequestForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "directRequest" });
  const profile = await prisma.caregiverProfile.findFirst({
    where: { id, isPlatformVisible: true, isActive: true },
    include: { user: { select: { name: true } } },
  });
  if (!profile) return { title: `pflegematch` };
  return { title: `${t("title")} · ${profile.user.name} · pflegematch` };
}

export default async function AnfragePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const profile = await prisma.caregiverProfile.findFirst({
    where: { id, isPlatformVisible: true, isActive: true },
    include: { user: { select: { name: true } } },
  });

  if (!profile) notFound();

  const t = await getTranslations({ locale, namespace: "directRequest" });

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-[#C06B4A] flex items-center justify-center">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-xl font-bold text-[#2D2D2D]">
          pflege<span className="text-[#C06B4A]">match</span>
          <span className="text-[11px] align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
        </span>
      </Link>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#EAD9C8] p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#2D2D2D]">{t("title")}</h1>
          <p className="text-sm text-[#2D2D2D]/55 mt-0.5">
            {t("subtitle", { name: profile.user.name ?? "Pflegekraft" })}
          </p>
        </div>
        <DirectRequestForm
          caregiverProfileId={profile.id}
          caregiverName={profile.user.name ?? "Pflegekraft"}
          locale={locale}
        />
      </div>
    </div>
  );
}
