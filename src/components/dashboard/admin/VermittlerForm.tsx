"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  tenantName:    z.string().min(2, "Min. 2 Zeichen"),
  tenantSlug:    z.string().min(2, "Min. 2 Zeichen").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  tenantEmail:   z.string().email("Ungültige E-Mail"),
  tenantPhone:   z.string().optional(),
  tenantAddress: z.string().optional(),
  userName:      z.string().min(2, "Min. 2 Zeichen"),
  userEmail:     z.string().email("Ungültige E-Mail"),
  userPassword:  z.string().min(8, "Min. 8 Zeichen"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: FormData) => Promise<any>;
}

export default function VermittlerForm({ onSubmit }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({ resolver: zodResolver(schema) as any });

  async function submit(data: FormData) {
    setServerError(null);
    const result = await onSubmit(data);
    if (result?.error) setServerError(result.error);
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors";

  const labelClass = "block text-xs font-medium text-white/60 mb-1.5";
  const errorClass = "text-xs text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5 max-w-2xl">
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {serverError}
        </div>
      )}

      {/* Organisation */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white">Organisation</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Firmenname *</label>
            <input {...register("tenantName")} placeholder="Pflegedienst Wien GmbH" className={inputClass} />
            {errors.tenantName && <p className={errorClass}>{errors.tenantName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input {...register("tenantSlug")} placeholder="pflegedienst-wien" className={inputClass} />
            {errors.tenantSlug && <p className={errorClass}>{errors.tenantSlug.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input {...register("tenantEmail")} type="email" placeholder="office@firma.at" className={inputClass} />
            {errors.tenantEmail && <p className={errorClass}>{errors.tenantEmail.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input {...register("tenantPhone")} placeholder="+43 1 234 5678" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Adresse</label>
          <input {...register("tenantAddress")} placeholder="Musterstraße 1, 1010 Wien" className={inputClass} />
        </div>
      </div>

      {/* Admin-Benutzer */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white">Admin-Benutzer</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input {...register("userName")} placeholder="Vorname Nachname" className={inputClass} />
            {errors.userName && <p className={errorClass}>{errors.userName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input {...register("userEmail")} type="email" placeholder="admin@firma.at" className={inputClass} />
            {errors.userEmail && <p className={errorClass}>{errors.userEmail.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Passwort * (min. 8 Zeichen)</label>
          <div className="relative">
            <input
              {...register("userPassword")}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              className={inputClass + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.userPassword && <p className={errorClass}>{errors.userPassword.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Vermittler anlegen
      </button>
    </form>
  );
}
