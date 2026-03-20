import { Heart } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import RegistrationForm from "@/components/public/RegistrationForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "register" });
  return { title: `${t("title")} · pflegematch` };
}

export default async function RegistrierungPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "register" });

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

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#EAD9C8] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2D2D2D]">{t("title")}</h1>
          <p className="text-sm text-[#2D2D2D]/55 mt-1">{t("subtitle")}</p>
        </div>
        <RegistrationForm locale={locale} />
      </div>
    </div>
  );
}
