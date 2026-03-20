"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import { RegistrationBaseSchema, type RegistrationFormData } from "@/lib/pfleger-schemas";
import { registerFreelancePfleger } from "@/lib/pfleger-actions";

const SKILL_SUGGESTIONS = [
  "Demenzpflege", "Mobilisation", "Wundversorgung", "Medikamentengabe",
  "Grundpflege", "Aktivierung", "Begleitung", "Haushalt",
];

const LANGUAGE_SUGGESTIONS = [
  "Deutsch", "Englisch", "Kroatisch", "Rumänisch", "Serbisch",
  "Ungarisch", "Slowakisch", "Tschechisch",
];

const AVAILABILITY_OPTIONS = [
  { value: "FULL_TIME", labelKey: "FULL_TIME" },
  { value: "PART_TIME", labelKey: "PART_TIME" },
  { value: "HOURLY",    labelKey: "HOURLY" },
  { value: "LIVE_IN",   labelKey: "LIVE_IN" },
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

export default function RegistrationForm({ locale }: { locale: string }) {
  const t = useTranslations("register");
  const tProfile = useTranslations("publicProfile");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  const {
    register,
    handleSubmit,
    control,
    trigger,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: standardSchemaResolver(RegistrationBaseSchema) as any,
    defaultValues: {
      availability: "PART_TIME",
      qualifications: [],
      skills: [],
      languages: [],
    },
  });

  const steps = [
    { title: t("step1Title"), fields: ["name", "email", "password", "passwordConfirm"] as const },
    { title: t("step2Title"), fields: ["bio", "skills", "languages", "qualifications"] as const },
    { title: t("step3Title"), fields: ["locationCity", "locationState", "travelRadius", "hourlyRate", "availability"] as const },
  ];

  async function goNext() {
    const valid = await trigger(steps[step].fields as Parameters<typeof trigger>[0]);
    if (!valid) return;
    // Step 0: manually check password match (zodResolver can't use .refine() in Zod v4)
    if (step === 0) {
      const { password, passwordConfirm } = getValues();
      if (password !== passwordConfirm) {
        setError("passwordConfirm", { message: t("errors.passwordMismatch") });
        return;
      }
    }
    setStep((s) => s + 1);
  }

  async function onSubmit(data: RegistrationFormData) {
    setServerError(null);
    const result = await registerFreelancePfleger(data);
    if (result.error) {
      setServerError(result.error === "emailTaken" ? t("errors.emailTaken") : t("errors.general"));
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push(`/${locale}/dashboard/pfleger`), 1500);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="w-16 h-16 rounded-full bg-[#7B9E7B]/20 flex items-center justify-center">
          <Check className="w-8 h-8 text-[#7B9E7B]" />
        </div>
        <p className="text-[#2D2D2D] font-semibold">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step
                  ? "bg-[#7B9E7B] text-white"
                  : i === step
                  ? "bg-[#C06B4A] text-white"
                  : "bg-[#EAD9C8] text-[#2D2D2D]/40"
              }`}
            >
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 rounded ${i < step ? "bg-[#7B9E7B]" : "bg-[#EAD9C8]"}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm font-semibold text-[#2D2D2D]">{steps[step].title}</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("name")} *</label>
                  <input {...register("name")} placeholder={t("namePlaceholder")} className={inputClass} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("email")} *</label>
                  <input {...register("email")} type="email" placeholder={t("emailPlaceholder")} className={inputClass} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("password")} *</label>
                  <input {...register("password")} type="password" placeholder={t("passwordPlaceholder")} className={inputClass} />
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("passwordConfirm")} *</label>
                  <input {...register("passwordConfirm")} type="password" placeholder={t("passwordConfirmPlaceholder")} className={inputClass} />
                  {errors.passwordConfirm && <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm.message}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("bio")}</label>
                <textarea {...register("bio")} rows={3} placeholder={t("bioPlaceholder")} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">{t("skills")}</label>
                <Controller
                  control={control}
                  name="skills"
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} suggestions={SKILL_SUGGESTIONS} />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">{t("languages")}</label>
                <Controller
                  control={control}
                  name="languages"
                  render={({ field }) => (
                    <TagInput value={field.value} onChange={field.onChange} suggestions={LANGUAGE_SUGGESTIONS} />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("qualifications")}</label>
                <Controller
                  control={control}
                  name="qualifications"
                  render={({ field }) => (
                    <input
                      placeholder={t("qualificationsPlaceholder")}
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
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("city")}</label>
                  <input {...register("locationCity")} placeholder={t("cityPlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("state")}</label>
                  <input {...register("locationState")} placeholder={t("statePlaceholder")} className={inputClass} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("travelRadius")}</label>
                  <input {...register("travelRadius")} type="number" placeholder={t("travelRadiusPlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">{t("hourlyRate")}</label>
                  <input {...register("hourlyRate")} type="number" step="0.5" placeholder={t("hourlyRatePlaceholder")} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-2">{t("availability")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABILITY_OPTIONS.map(({ value }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={value} {...register("availability")} className="accent-[#C06B4A]" />
                      <span className="text-sm text-[#2D2D2D]/80">{tProfile(`availabilityTypes.${value}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 text-sm text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t("back")}
          </button>
        ) : (
          <div />
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-1.5 bg-[#C06B4A] hover:bg-[#A05438] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {t("next")}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        )}
      </div>

      <p className="text-xs text-center text-[#2D2D2D]/50">
        {t("alreadyAccount")}{" "}
        <Link href="/login" className="text-[#C06B4A] hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
