"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Min. 2 Zeichen"),
  email: z.string().email("Ungültige E-Mail"),
  careNeedsDescription: z.string().optional(),
  pflegegeldStufe: z.enum(["STUFE_1","STUFE_2","STUFE_3","STUFE_4","STUFE_5"]).optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredLanguages: z.array(z.string()).default([]),
  preferredSchedule: z.enum(["FULL_TIME","PART_TIME","HOURLY","LIVE_IN"]).optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  locationPostal: z.string().optional(),
  addressStreet: z.string().optional(),
  addressCountry: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const SKILL_SUGGESTIONS = ["Demenzpflege","Mobilisation","Wundversorgung","Grundpflege","Aktivierung","Begleitung","Haushalt"];
const LANGUAGE_SUGGESTIONS = ["Deutsch","Englisch","Ungarisch","Kroatisch","Serbisch","Rumänisch"];
const PFLEGESTUFEN = [
  { value: "STUFE_1", label: "Stufe 1" }, { value: "STUFE_2", label: "Stufe 2" },
  { value: "STUFE_3", label: "Stufe 3" }, { value: "STUFE_4", label: "Stufe 4" },
  { value: "STUFE_5", label: "Stufe 5" },
];

function TagInput({ value, onChange, suggestions }: { value: string[]; onChange: (v: string[]) => void; suggestions: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
        <button key={s} type="button"
          onClick={() => onChange(value.includes(s) ? value.filter((v) => v !== s) : [...value, s])}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${value.includes(s) ? "bg-[#C06B4A] text-white border-[#C06B4A]" : "bg-white text-[#2D2D2D]/60 border-[#EAD9C8] hover:border-[#C06B4A]/50"}`}
        >{s}</button>
      ))}
    </div>
  );
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<any>;
  defaultValues?: Partial<FormData>;
  isEdit?: boolean;
  disableEmail?: boolean;
}

export default function KlientForm({ onSubmit, defaultValues, isEdit, disableEmail }: Props) {
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: standardSchemaResolver(schema) as any,
    defaultValues: { requiredSkills: [], preferredLanguages: [], isActive: true, ...defaultValues },
  });

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  return (
    <form onSubmit={handleSubmit((data) => startTransition(() => { onSubmit(data); }))} className="space-y-6 max-w-2xl">

      {/* Stammdaten */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Stammdaten</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Name *</label>
            <input {...register("name")} placeholder="Vorname Nachname" autoComplete="off" className={inputClass} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">E-Mail *</label>
            <input {...register("email")} type="email" disabled={disableEmail} placeholder="name@example.at" className={`${inputClass} ${disableEmail ? "opacity-50 cursor-not-allowed" : ""}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Pflegegeld-Stufe</label>
          <select {...register("pflegegeldStufe")} className={inputClass}>
            <option value="">– Bitte wählen –</option>
            {PFLEGESTUFEN.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Pflegebedarf (Beschreibung)</label>
          <textarea {...register("careNeedsDescription")} rows={3} placeholder="Beschreiben Sie den Pflegebedarf..." className={inputClass} />
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
            <input {...register("locationPostal")} placeholder="1010" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Ort</label>
            <input {...register("locationCity")} placeholder="Wien" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Land</label>
            <input {...register("addressCountry")} placeholder="Österreich" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Bundesland</label>
          <input {...register("locationState")} placeholder="Wien" className={inputClass} />
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

      {/* Anforderungen */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Anforderungen</h3>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">Benötigte Skills</label>
          <Controller control={control} name="requiredSkills" render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} suggestions={SKILL_SUGGESTIONS} />
          )} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">Bevorzugte Sprachen</label>
          <Controller control={control} name="preferredLanguages" render={({ field }) => (
            <TagInput value={field.value} onChange={field.onChange} suggestions={LANGUAGE_SUGGESTIONS} />
          )} />
        </div>
      </div>

      {/* Notfallkontakt */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Notfallkontakt</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Name</label>
            <input {...register("emergencyContactName")} placeholder="Kontaktperson" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Telefon</label>
            <input {...register("emergencyContactPhone")} placeholder="+43 ..." className={inputClass} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 accent-[#7B9E7B]" />
        <label htmlFor="isActive" className="text-sm font-medium text-[#2D2D2D]">Klient ist aktiv</label>
      </div>

      <button type="submit" disabled={isPending}
        className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEdit ? "Änderungen speichern" : "Klient anlegen"}
      </button>
    </form>
  );
}
