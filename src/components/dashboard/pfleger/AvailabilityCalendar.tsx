"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { AvailabilitySchema, type AvailabilityFormData } from "@/lib/pfleger-schemas";
import { createAvailability, deleteAvailability } from "@/lib/pfleger-actions";
import type { CaregiverAvailability } from "@prisma/client";

const STATUS_CONFIG = {
  AVAILABLE:  { color: "bg-[#7B9E7B]/15 text-[#7B9E7B] border-[#7B9E7B]/30" },
  VACATION:   { color: "bg-blue-50 text-blue-600 border-blue-200" },
  BLOCKED:    { color: "bg-gray-100 text-gray-500 border-gray-200" },
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.BLOCKED;
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${cfg.color}`}>
      {label}
    </span>
  );
}

interface Props {
  entries: CaregiverAvailability[];
}

export default function AvailabilityCalendar({ entries: initialEntries }: Props) {
  const t = useTranslations("dashboard.pfleger.availability");
  const [entries, setEntries] = useState(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AvailabilityFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(AvailabilitySchema) as any,
    defaultValues: { status: "AVAILABLE" },
  });

  async function onSubmit(data: AvailabilityFormData) {
    setServerError(null);
    const result = await createAvailability(data);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    // Optimistic: reload with new entry approximation (server will revalidate)
    reset({ status: "AVAILABLE" });
    setShowForm(false);
    // Trigger page refresh via router – simplest approach since this is a server-action
    window.location.reload();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteAvailability(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  }

  const statuses = [
    { value: "AVAILABLE", label: t("statuses.AVAILABLE") },
    { value: "VACATION",  label: t("statuses.VACATION") },
    { value: "BLOCKED",   label: t("statuses.BLOCKED") },
  ] as const;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2D2D2D]">{t("title")}</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("addEntry")}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4"
            >
              <h3 className="font-semibold text-[#2D2D2D]">{t("addEntryTitle")}</h3>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">{t("status")}</label>
                <div className="flex gap-3">
                  {statuses.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" value={value} {...register("status")} className="accent-[#C06B4A]" />
                      <span className="text-sm text-[#2D2D2D]/80">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("from")} *</label>
                  <input type="date" {...register("startDate")} className={inputClass} />
                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("to")}</label>
                  <input type="date" {...register("endDate")} className={inputClass} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("notes")}</label>
                <input {...register("notes")} placeholder={t("notesPlaceholder")} className={inputClass} />
              </div>

              {serverError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t("save")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm text-[#2D2D2D]/55 hover:text-[#2D2D2D] transition-colors"
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry list */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-sm text-[#2D2D2D]/40">
          {t("noEntries")}
        </div>
      ) : (
        <div className="space-y-2">
          {entries
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusBadge
                      status={entry.status}
                      label={t(`statuses.${entry.status as "AVAILABLE" | "VACATION" | "BLOCKED"}`)}
                    />
                    <span className="text-sm text-[#2D2D2D] font-medium">
                      {format(new Date(entry.startDate), "dd. MMM yyyy", { locale: de })}
                      {entry.endDate && (
                        <> – {format(new Date(entry.endDate), "dd. MMM yyyy", { locale: de })}</>
                      )}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="text-xs text-[#2D2D2D]/50 truncate">{entry.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="p-2 rounded-lg text-[#2D2D2D]/30 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                  aria-label={t("delete")}
                >
                  {deletingId === entry.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
