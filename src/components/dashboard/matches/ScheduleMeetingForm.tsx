"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { scheduleVideoMeeting } from "@/app/(dashboard)/vermittler/matches/video-actions";

const schema = z.object({
  scheduledAt: z.string().min(1, "Bitte Datum und Uhrzeit wählen"),
  durationMin: z.coerce.number().refine((v) => v === 30 || v === 60, "Bitte Dauer wählen"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-xl border border-[#EAD9C8] bg-white px-4 py-2.5 text-sm text-[#2D2D2D] placeholder-[#2D2D2D]/40 focus:outline-none focus:ring-2 focus:ring-[#C06B4A]/30 focus:border-[#C06B4A] transition";

interface ScheduleMeetingFormProps {
  matchId: string;
  matchLabel: string;
}

export default function ScheduleMeetingForm({
  matchId,
  matchLabel,
}: ScheduleMeetingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: standardSchemaResolver(schema) as any,
    defaultValues: { durationMin: 30 },
  });

  async function onSubmit(data: FormData) {
    const result = await scheduleVideoMeeting(matchId, data);
    if (result?.error) {
      setError("root", { message: result.error });
    }
  }

  // Min datetime = now + 5 minutes
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] p-6 max-w-lg">
      <h2 className="text-lg font-semibold text-[#2D2D2D] mb-1">
        Videotermin planen
      </h2>
      <p className="text-sm text-[#2D2D2D]/60 mb-6">{matchLabel}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
            Datum &amp; Uhrzeit
          </label>
          <input
            type="datetime-local"
            min={minDateTime}
            {...register("scheduledAt")}
            className={inputClass}
          />
          {errors.scheduledAt && (
            <p className="mt-1 text-xs text-red-500">
              {errors.scheduledAt.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
            Dauer
          </label>
          <div className="flex gap-3">
            {[30, 60].map((min) => (
              <label key={min} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={min}
                  {...register("durationMin")}
                  className="accent-[#C06B4A]"
                />
                <span className="text-sm text-[#2D2D2D]">{min} Minuten</span>
              </label>
            ))}
          </div>
          {errors.durationMin && (
            <p className="mt-1 text-xs text-red-500">
              {errors.durationMin.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
            Hinweis <span className="text-[#2D2D2D]/40">(optional)</span>
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="z.B. Themen für das Gespräch…"
            className={inputClass + " resize-none"}
          />
        </div>

        {errors.root && (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C06B4A] text-white font-medium py-2.5 text-sm hover:bg-[#A05438] disabled:opacity-60 transition"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Termin erstellen
        </button>
      </form>
    </div>
  );
}
