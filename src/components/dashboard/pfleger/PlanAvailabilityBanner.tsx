"use client";

import { useState, useTransition } from "react";
import { CalendarCheck, CalendarX, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { planAvailabilityBlocks } from "@/lib/pfleger-actions";

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function PlanAvailabilityBanner({
  plannedBlocks,
  availabilityHref,
}: {
  plannedBlocks: number;
  availabilityHref: string;
}) {
  const t = useTranslations("dashboard.pfleger.planBanner");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));

  if (plannedBlocks > 0) {
    return (
      <div className="flex items-center gap-3 bg-[#F0F7F0] border border-[#7B9E7B]/40 rounded-2xl px-5 py-4">
        <CalendarCheck className="w-5 h-5 text-[#5A7A5A] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#3A5A3A]">
            {t("blocksPlanned", { count: plannedBlocks })}
          </p>
          <p className="text-xs text-[#3A5A3A]/60">{t("horizon")}</p>
        </div>
        <Link
          href={availabilityHref}
          className="text-xs font-medium text-[#5A7A5A] underline underline-offset-2 hover:text-[#3A5A3A] transition-colors shrink-0"
        >
          {t("edit")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF7ED] border border-[#D97706]/30 rounded-2xl px-5 py-4">
      <div className="flex items-start gap-3">
        <CalendarX className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#92400E]">{t("noBlocks")}</p>
          <p className="text-xs text-[#92400E]/70 mt-0.5 mb-3">{t("description")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-[#92400E]/80">{t("firstBlock")}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-[#D97706]/40 bg-white focus:outline-none focus:border-[#D97706] transition-colors"
            />
            <button
              disabled={isPending || !startDate}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await planAvailabilityBlocks(new Date(startDate));
                  if (result.error) setError(result.error);
                })
              }
              className="inline-flex items-center gap-1.5 bg-[#D97706] hover:bg-[#B45309] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              {t("planButton")}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
