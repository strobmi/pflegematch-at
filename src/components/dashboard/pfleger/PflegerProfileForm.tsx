"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { Loader2, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ProfileUpdateSchema, type ProfileUpdateData } from "@/lib/pfleger-schemas";
import { updateOwnProfile } from "@/lib/pfleger-actions";
import { requestEmailChange } from "@/lib/email-change-actions";
import type { CaregiverProfile, User } from "@prisma/client";

const SKILL_SUGGESTIONS = [
  "Demenzpflege", "Mobilisation", "Wundversorgung", "Medikamentengabe",
  "Grundpflege", "Aktivierung", "Begleitung", "Haushalt",
];

const LANGUAGE_SUGGESTIONS = [
  "Deutsch", "Englisch", "Kroatisch", "Rumänisch", "Serbisch",
  "Ungarisch", "Slowakisch", "Tschechisch",
];

const AVAILABILITY_OPTIONS = [
  { value: "FULL_TIME" },
  { value: "PART_TIME" },
  { value: "HOURLY" },
  { value: "LIVE_IN" },
] as const;

function TagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  suggestions: string[];
}) {
  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((v) => v !== tag) : [...value, tag]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
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
  );
}

interface Props {
  profile: CaregiverProfile;
  user: Pick<User, "name" | "email">;
  locale: string;
}

export default function PflegerProfileForm({ profile, user, locale }: Props) {
  const t = useTranslations("dashboard.pfleger.profile");
  const tProfile = useTranslations("publicProfile");
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // E-Mail-Änderung state
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeStatus, setEmailChangeStatus] = useState<"idle" | "success" | "error">("idle");
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [isEmailChangePending, startEmailChangeTransition] = useTransition();

  function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setEmailChangeStatus("idle");
    setEmailChangeError(null);
    startEmailChangeTransition(async () => {
      const result = await requestEmailChange(newEmail);
      if (result.ok) {
        setEmailChangeStatus("success");
        setNewEmail("");
      } else {
        setEmailChangeStatus("error");
        setEmailChangeError(
          result.error?.includes("bereits verwendet")
            ? t("emailChange.errorTaken")
            : t("emailChange.errorGeneral")
        );
      }
    });
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: standardSchemaResolver(ProfileUpdateSchema) as any,
    defaultValues: {
      name: user.name ?? "",
      bio: profile.bio ?? "",
      qualifications: profile.qualifications ?? [],
      skills: profile.skills ?? [],
      languages: profile.languages ?? [],
      availability: (profile.availability as ProfileUpdateData["availability"]) ?? "PART_TIME",
      locationCity: profile.locationCity ?? "",
      locationState: profile.locationState ?? "",
      travelRadius: profile.travelRadius ?? undefined,
      hourlyRate: profile.hourlyRate ? Number(profile.hourlyRate) : undefined,
      isActive: profile.isActive,
      isPlatformVisible: profile.isPlatformVisible,
      addressStreet: profile.addressStreet ?? "",
      addressPostal: profile.addressPostal ?? "",
      addressCity: profile.addressCity ?? "",
      addressCountry: profile.addressCountry ?? "",
      iban: profile.iban ?? "",
      bic: profile.bic ?? "",
      bankAccountHolder: profile.bankAccountHolder ?? "",
      referredBy: profile.referredBy ?? "",
    },
  });

  const isPlatformVisible = watch("isPlatformVisible");

  async function onSubmit(data: ProfileUpdateData) {
    setServerError(null);
    const result = await updateOwnProfile(data);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Personal Data */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">Kurzübersicht</h3>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Name *</label>
          <input {...register("name")} className={inputClass} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
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
            <input {...register("travelRadius")} type="number" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Stundensatz (€)</label>
            <input {...register("hourlyRate")} type="number" step="0.5" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Über mich</label>
          <textarea {...register("bio")} rows={4} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Empfohlen durch</label>
          <input {...register("referredBy")} placeholder="Name der Person oder Organisation" className={inputClass} />
        </div>
      </div>

      {/* E-Mail-Adresse ändern */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
        <h3 className="font-semibold text-[#2D2D2D]">{t("emailChange.title")}</h3>
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("emailChange.currentLabel")}</label>
          <input value={user.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
        </div>
        <form onSubmit={handleEmailChange} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("emailChange.newLabel")}</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={t("emailChange.newPlaceholder")}
              className={inputClass}
            />
          </div>
          {emailChangeStatus === "success" && (
            <p className="text-sm text-[#7B9E7B] bg-[#7B9E7B]/10 px-3 py-2 rounded-lg">{t("emailChange.success")}</p>
          )}
          {emailChangeStatus === "error" && emailChangeError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{emailChangeError}</p>
          )}
          <button
            type="submit"
            disabled={isEmailChangePending || !newEmail}
            className="bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
          >
            {isEmailChangePending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEmailChangePending ? t("emailChange.submitting") : t("emailChange.submit")}
          </button>
        </form>
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
        <p className="text-xs text-[#2D2D2D]/50">Nur intern sichtbar – nicht auf dem öffentlichen Profil.</p>
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
          {AVAILABILITY_OPTIONS.map(({ value }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value={value} {...register("availability")} className="accent-[#C06B4A]" />
              <span className="text-sm text-[#2D2D2D]/80">{tProfile(`availabilityTypes.${value}`)}</span>
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
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Qualifikationen</label>
          <Controller
            control={control}
            name="qualifications"
            render={({ field }) => (
              <input
                placeholder="z.B. DGKP, Heimhilfe, ..."
                className={inputClass}
                value={field.value.join(", ")}
                onChange={(e) =>
                  field.onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                }
              />
            )}
          />
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="isPlatformVisible"
            {...register("isPlatformVisible")}
            className="w-4 h-4 accent-[#C06B4A] mt-0.5 flex-shrink-0"
          />
          <div>
            <label htmlFor="isPlatformVisible" className="text-sm font-medium text-[#2D2D2D] cursor-pointer">
              {t("visibilityLabel")}
            </label>
            <p className="text-xs text-[#2D2D2D]/50 mt-0.5">{t("visibilityHint")}</p>
          </div>
        </div>
        {isPlatformVisible && (
          <Link
            href={`/${locale}/pfleger/${profile.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-[#C06B4A] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {t("publicProfile")}
          </Link>
        )}
        <div className="flex items-center gap-3 pt-1 border-t border-[#EAD9C8]">
          <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 accent-[#7B9E7B]" />
          <label htmlFor="isActive" className="text-sm font-medium text-[#2D2D2D] cursor-pointer">
            Aktiv & verfügbar
          </label>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved ? (
          <>
            <Check className="w-4 h-4" />
            {t("saved")}
          </>
        ) : isSubmitting ? (
          t("saving")
        ) : (
          t("save")
        )}
      </button>
    </form>
  );
}
