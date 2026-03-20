"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { Check, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { DirectRequestSchema, type DirectRequestFormData } from "@/lib/pfleger-schemas";
import { createDirectRequest } from "@/lib/pfleger-actions";

interface Props {
  caregiverProfileId: string;
  caregiverName: string;
  locale: string;
}

export default function DirectRequestForm({ caregiverProfileId, caregiverName, locale }: Props) {
  const t = useTranslations("directRequest");
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DirectRequestFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(DirectRequestSchema) as any,
    defaultValues: { caregiverProfileId },
  });

  async function onSubmit(data: DirectRequestFormData) {
    setServerError(null);
    const result = await createDirectRequest(data);
    if (result.error) {
      setServerError(t("errors.general"));
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-5 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#7B9E7B]/15 flex items-center justify-center">
          <Check className="w-8 h-8 text-[#7B9E7B]" />
        </div>
        <p className="text-[#2D2D2D] font-semibold max-w-xs">{t("success")}</p>
        <Link
          href={`/${locale}/pfleger/${caregiverProfileId}`}
          className="text-sm text-[#C06B4A] hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t("backToProfile")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Hidden field */}
      <input type="hidden" {...register("caregiverProfileId")} />

      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("contactName")} *</label>
            <input {...register("contactName")} placeholder={t("contactNamePlaceholder")} className={inputClass} />
            {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("contactEmail")} *</label>
            <input {...register("contactEmail")} type="email" placeholder={t("contactEmailPlaceholder")} className={inputClass} />
            {errors.contactEmail && <p className="text-xs text-red-500 mt-1">{errors.contactEmail.message}</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("contactPhone")}</label>
            <input {...register("contactPhone")} type="tel" placeholder={t("contactPhonePlaceholder")} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("preferredStart")}</label>
            <input {...register("preferredStart")} type="date" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("careNeeds")} *</label>
          <textarea
            {...register("careNeedsRaw")}
            rows={4}
            placeholder={t("careNeedsPlaceholder")}
            className={inputClass}
          />
          {errors.careNeedsRaw && <p className="text-xs text-red-500 mt-1">{errors.careNeedsRaw.message}</p>}
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      <div className="flex items-center justify-between">
        <Link
          href={`/${locale}/pfleger/${caregiverProfileId}`}
          className="flex items-center gap-1 text-sm text-[#2D2D2D]/55 hover:text-[#2D2D2D] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("backToProfile")}
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
