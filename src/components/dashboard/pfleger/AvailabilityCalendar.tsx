"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  format, addMonths, subMonths, startOfMonth, getDay,
  getDaysInMonth, isToday,
} from "date-fns";
import { de } from "date-fns/locale";
import { Plus, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { AvailabilitySchema, type AvailabilityFormData } from "@/lib/pfleger-schemas";
import { createAvailability, deleteAvailability } from "@/lib/pfleger-actions";
import type { CaregiverAvailability } from "@prisma/client";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  AVAILABLE:     { cell: "#E8F2E8", text: "#2D5A2D", badge: "bg-[#7B9E7B]/15 text-[#7B9E7B] border-[#7B9E7B]/30" },
  VACATION:      { cell: "#DBEAFE", text: "#1D4ED8",  badge: "bg-blue-50 text-blue-600 border-blue-200" },
  BLOCKED:       { cell: "#FEE2E2", text: "#991B1B",  badge: "bg-gray-100 text-gray-500 border-gray-200" },
  ON_ASSIGNMENT: { cell: "#FEF3C7", text: "#92400E",  badge: "bg-[#F5EDE3] text-[#C06B4A] border-[#EAD9C8]" },
} as const;

const STATUS_PRIORITY = ["BLOCKED", "VACATION", "ON_ASSIGNMENT", "AVAILABLE"] as const;

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusForDay(
  day: Date,
  entries: CaregiverAvailability[]
): keyof typeof STATUS_CONFIG | null {
  const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(day); dayEnd.setHours(23, 59, 59, 999);

  const active = entries.filter((e) => {
    const start = new Date(e.startDate);
    const end   = e.endDate ? new Date(e.endDate) : null;
    return start <= dayEnd && (end == null || end >= dayStart);
  });

  for (const p of STATUS_PRIORITY) {
    if (active.some((e) => e.status === p)) return p;
  }
  return null;
}

// Monday = 0, …, Sunday = 6
function mondayOffset(date: Date): number {
  return (getDay(date) + 6) % 7;
}

// ─── Month Calendar Grid ──────────────────────────────────────────────────────

function MonthCalendar({
  month,
  entries,
}: {
  month: Date;
  entries: CaregiverAvailability[];
}) {
  const firstDay  = startOfMonth(month);
  const totalDays = getDaysInMonth(month);
  const offset    = mondayOffset(firstDay);

  // Build weeks: each week is 7 cells (null = empty padding)
  const allCells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to complete last week
  while (allCells.length % 7 !== 0) allCells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < allCells.length; i += 7) weeks.push(allCells.slice(i, i + 7));

  return (
    <div className="w-full">
      {/* Weekday header */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}
        className="border-b border-[#EAD9C8]"
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => (
        <div
          key={wi}
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}
          className="border-b border-[#EAD9C8] last:border-b-0"
        >
          {week.map((dayNum, di) => {
            if (!dayNum) {
              return (
                <div
                  key={`e-${wi}-${di}`}
                  className="min-h-[52px] border-r border-[#EAD9C8] last:border-r-0 bg-[#FAF6F1]/40"
                />
              );
            }

            const day    = new Date(month.getFullYear(), month.getMonth(), dayNum);
            const status = getStatusForDay(day, entries);
            const cfg    = status ? STATUS_CONFIG[status] : null;
            const today  = isToday(day);

            return (
              <div
                key={dayNum}
                className="min-h-[52px] border-r border-[#EAD9C8] last:border-r-0 p-1.5 relative"
                style={{ backgroundColor: cfg?.cell ?? "transparent" }}
              >
                <span
                  className={`
                    text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                    ${today
                      ? "bg-[#C06B4A] text-white"
                      : cfg
                      ? ""
                      : "text-[#2D2D2D]/70"
                    }
                  `}
                  style={cfg && !today ? { color: cfg.text } : {}}
                >
                  {dayNum}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.BLOCKED;
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${cfg.badge}`}>
      {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  entries: CaregiverAvailability[];
}

export default function AvailabilityCalendar({ entries: initialEntries }: Props) {
  const t = useTranslations("dashboard.pfleger.availability");
  const [entries, setEntries]         = useState(initialEntries);
  const [showForm, setShowForm]       = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors";

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<AvailabilityFormData>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: standardSchemaResolver(AvailabilitySchema) as any,
      defaultValues: { status: "AVAILABLE" },
    });

  async function onSubmit(data: AvailabilityFormData) {
    setServerError(null);
    const result = await createAvailability(data);
    if (result.error) { setServerError(result.error); return; }
    reset({ status: "AVAILABLE" });
    setShowForm(false);
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

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="space-y-5 max-w-2xl">
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
                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-[#2D2D2D]/55 hover:text-[#2D2D2D] transition-colors">
                  {t("cancel")}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar card */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EAD9C8]">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-[#FAF6F1] text-[#2D2D2D]/40 hover:text-[#2D2D2D] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#2D2D2D]">
              {format(currentMonth, "MMMM", { locale: de })}
            </span>
            <span className="text-base font-light text-[#2D2D2D]/50">
              {format(currentMonth, "yyyy")}
            </span>
          </div>

          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-[#FAF6F1] text-[#2D2D2D]/40 hover:text-[#2D2D2D] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <MonthCalendar month={currentMonth} entries={entries} />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-5 py-3 border-t border-[#EAD9C8]">
          {(["AVAILABLE", "VACATION", "BLOCKED"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm border border-black/10"
                style={{ backgroundColor: STATUS_CONFIG[s].cell }}
              />
              <span className="text-xs text-[#2D2D2D]/55">{t(`statuses.${s}`)}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#C06B4A]" />
            <span className="text-xs text-[#2D2D2D]/55">Heute</span>
          </div>
        </div>
      </div>

      {/* Entry list (compact, for delete) */}
      {sortedEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-sm text-[#2D2D2D]/40">
          {t("noEntries")}
        </div>
      ) : (
        <div className="space-y-1.5">
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-[#EAD9C8] px-4 py-3 flex items-center gap-3"
            >
              <StatusBadge
                status={entry.status}
                label={t(`statuses.${entry.status as "AVAILABLE" | "VACATION" | "BLOCKED"}`)}
              />
              <span className="text-sm text-[#2D2D2D]/70 flex-1 min-w-0">
                {format(new Date(entry.startDate), "dd. MMM yyyy", { locale: de })}
                {entry.endDate && (
                  <> – {format(new Date(entry.endDate), "dd. MMM yyyy", { locale: de })}</>
                )}
              </span>
              {entry.notes && (
                <span className="text-xs text-[#2D2D2D]/40 truncate max-w-32 hidden sm:block">{entry.notes}</span>
              )}
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="p-1.5 rounded-lg text-[#2D2D2D]/25 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 shrink-0"
                aria-label={t("delete")}
              >
                {deletingId === entry.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
