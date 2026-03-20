"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Check, Loader2, Mail, Phone, CalendarDays } from "lucide-react";
import { markDirectRequestProcessed } from "@/lib/pfleger-actions";
import type { MatchRequest } from "@prisma/client";

export default function DirectRequestCard({ request }: { request: MatchRequest }) {
  const t = useTranslations("dashboard.pfleger.requests");
  const [processed, setProcessed] = useState(request.isProcessed);
  const [loading, setLoading] = useState(false);

  async function handleProcess() {
    setLoading(true);
    await markDirectRequestProcessed(request.id);
    setProcessed(true);
    setLoading(false);
  }

  return (
    <div className={`bg-white rounded-2xl border p-5 space-y-3 transition-opacity ${processed ? "opacity-60 border-[#EAD9C8]" : "border-[#C06B4A]/30 shadow-sm"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm text-[#2D2D2D]">
            {t("from")}: {request.contactName}
          </p>
          <p className="text-xs text-[#2D2D2D]/45 mt-0.5">
            {t("receivedAt")}: {format(new Date(request.createdAt), "dd. MMM yyyy, HH:mm", { locale: de })}
          </p>
        </div>
        {processed ? (
          <span className="flex items-center gap-1 text-xs text-[#7B9E7B] font-medium bg-[#7B9E7B]/10 px-2.5 py-1 rounded-full">
            <Check className="w-3 h-3" />
            {t("processed")}
          </span>
        ) : null}
      </div>

      {/* Contact info */}
      <div className="flex flex-wrap gap-4 text-xs text-[#2D2D2D]/60">
        {request.contactEmail && (
          <a href={`mailto:${request.contactEmail}`} className="flex items-center gap-1 hover:text-[#C06B4A]">
            <Mail className="w-3.5 h-3.5" />
            {request.contactEmail}
          </a>
        )}
        {request.contactPhone && (
          <a href={`tel:${request.contactPhone}`} className="flex items-center gap-1 hover:text-[#C06B4A]">
            <Phone className="w-3.5 h-3.5" />
            {request.contactPhone}
          </a>
        )}
        {request.preferredStart && (
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {t("preferredStart")}: {format(new Date(request.preferredStart), "dd. MMM yyyy", { locale: de })}
          </span>
        )}
      </div>

      {/* Care needs */}
      {request.careNeedsRaw && (
        <div className="bg-[#FAF6F1] rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-[#2D2D2D]/60 mb-1">{t("careNeeds")}</p>
          <p className="text-sm text-[#2D2D2D]/80 leading-relaxed">{request.careNeedsRaw}</p>
        </div>
      )}

      {/* Action */}
      {!processed && (
        <button
          onClick={handleProcess}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-[#7B9E7B] hover:bg-[#7B9E7B]/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {t("markProcessed")}
        </button>
      )}
    </div>
  );
}
