"use client";

import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { CaregiverProfile, User } from "@prisma/client";

const schema = z.object({
  name: z.string().min(2, "Min. 2 Zeichen"),
  email: z.string().email("Ungültige E-Mail"),
  bio: z.string().optional(),
  qualifications: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  availability: z.enum(["FULL_TIME", "PART_TIME", "HOURLY", "LIVE_IN"]),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  travelRadius: z.coerce.number().optional(),
  hourlyRate: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  addressStreet: z.string().optional(),
  addressPostal: z.string().optional(),
  addressCity: z.string().optional(),
  addressCountry: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  referredBy: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const AVAILABILITY_OPTIONS = [
  { value: "FULL_TIME", label: "Vollzeit" },
  { value: "PART_TIME", label: "Teilzeit" },
  { value: "HOURLY",    label: "Stundenweise" },
  { value: "LIVE_IN",   label: "24h / Live-in" },
];

const SKILL_SUGGESTIONS = [
  "Demenzpflege", "Mobilisation", "Wundversorgung", "Medikamentengabe",
  "Grundpflege", "Aktivierung", "Begleitung", "Haushalt",
];

const LANGUAGE_SUGGESTIONS = [
  "Deutsch", "Englisch", "Ungarisch", "Kroatisch", "Serbisch",
  "Rumänisch", "Slowakisch", "Tschechisch",
];

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<any>;
  defaultValues?: Partial<FormData>;
  isEdit?: boolean;
  disableEmail?: boolean;
}

function TagInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((v) => v !== tag) : [...value, tag]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {(suggestions ?? []).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              value.includes(s)
                ? "bg-[#C06B4A] text-white border-[#C06B4A]"
                : "bg-white text-[#2D2D2D]/60 border-[#EAD9C8] hover:border-[#C06B4A]/50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PflegerForm({ onSubmit, defaultValues, isEdit, disableEmail }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({
    resolver: standardSchemaResolver(schema) as any,
    defaultValues: {
      availability: "PART_TIME",
      qualifications: [],
      skills: [],
      languages: [],
      isActive: true,
      ...defaultValues,
    },
  });

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Name & Email */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Kurzübersicht</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Name *</label>
            <input {...register("name")} placeholder="Vorname Nachname" className={inputClass} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">E-Mail *</label>
            <input {...register("email")} type="email" placeholder="name@example.at" disabled={disableEmail} className={`${inputClass} ${disableEmail ? "opacity-50 cursor-not-allowed" : ""}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Bevorzugte Einsatzregion (Stadt)</label>
            <input {...register("locationCity")} placeholder="z.B. Wien, Graz" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Bevorzugtes Bundesland</label>
            <input {...register("locationState")} placeholder="z.B. Wien" className={inputClass} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Aktionsradius (km)</label>
            <input {...register("travelRadius")} type="number" placeholder="z.B. 30" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Stundensatz (€)</label>
            <input {...register("hourlyRate")} type="number" step="0.5" placeholder="z.B. 18" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Kurzbiographie</label>
          <textarea {...register("bio")} rows={3} placeholder="Über die Pflegekraft..." className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Empfohlen durch</label>
          <input {...register("referredBy")} placeholder="Name der Person oder Organisation" className={inputClass} />
        </div>
      </div>

      {/* Wohnadresse */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Wohnadresse</h3>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Straße &amp; Hausnummer</label>
          <input {...register("addressStreet")} placeholder="Musterstraße 1" className={inputClass} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">PLZ</label>
            <input {...register("addressPostal")} placeholder="1010" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Ort</label>
            <input {...register("addressCity")} placeholder="Wien" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Land</label>
            <input {...register("addressCountry")} placeholder="Österreich" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Bankverbindung */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Bankverbindung</h3>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">IBAN</label>
          <input {...register("iban")} placeholder="AT12 3456 7890 1234 5678" className={inputClass} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">BIC</label>
            <input {...register("bic")} placeholder="RLNWATWW" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Kontoinhaber</label>
            <input {...register("bankAccountHolder")} placeholder="Vor- und Nachname" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
        <h3 className="font-semibold text-[#2D2D2D] mb-3">Verfügbarkeit</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AVAILABILITY_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input type="radio" value={value} {...register("availability")} className="accent-[#C06B4A]" />
              <span className="text-sm text-[#2D2D2D]/80">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills & Languages */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Qualifikationen & Sprachen</h3>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">Skills</label>
          <Controller
            control={control}
            name="skills"
            render={({ field }) => (
              <TagInput value={field.value} onChange={field.onChange} suggestions={SKILL_SUGGESTIONS} />
            )}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">Sprachen</label>
          <Controller
            control={control}
            name="languages"
            render={({ field }) => (
              <TagInput value={field.value} onChange={field.onChange} suggestions={LANGUAGE_SUGGESTIONS} />
            )}
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 accent-[#7B9E7B]" />
        <label htmlFor="isActive" className="text-sm font-medium text-[#2D2D2D]">
          Pflegekraft ist aktiv und verfügbar
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEdit ? "Änderungen speichern" : "Pflegekraft anlegen"}
      </button>
    </form>
  );
}
