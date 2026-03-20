"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Trash2 } from "lucide-react";

const schema = z.object({
  name:     z.string().min(2, "Min. 2 Zeichen"),
  email:    z.string().email("Ungültige E-Mail"),
  role:     z.enum(["SUPERADMIN", "VERMITTLER_ADMIN", "PFLEGER", "KUNDE"]),
  tenantId: z.string().optional(),
  password: z.string().min(8, "Min. 8 Zeichen").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const ROLES = [
  { value: "SUPERADMIN",       label: "Superadmin" },
  { value: "VERMITTLER_ADMIN", label: "Vermittler-Admin" },
  { value: "PFLEGER",          label: "Pfleger" },
  { value: "KUNDE",            label: "Kunde" },
];

interface Tenant { id: string; name: string }

interface Props {
  defaultValues: Partial<FormData>;
  tenants: Tenant[];
  userId: string;
  isSelf: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (userId: string, data: FormData) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete: (userId: string) => Promise<any>;
}

export default function UserEditForm({ defaultValues, tenants, userId, isSelf, onSubmit, onDelete }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({ resolver: standardSchemaResolver(schema) as any, defaultValues });

  async function submit(data: FormData) {
    setServerError(null);
    const result = await onSubmit(userId, { ...data, password: data.password || undefined });
    if (result?.error) setServerError(result.error);
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await onDelete(userId);
    if (result?.error) { setServerError(result.error); setDeleting(false); return; }
    router.push("/admin/users");
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

      {/* Stammdaten */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white">Stammdaten</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input {...register("name")} placeholder="Vorname Nachname" className={inputClass} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input {...register("email")} type="email" className={inputClass} />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Rolle *</label>
            <select {...register("role")} className={inputClass + " cursor-pointer"}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-[#2D2D2D]">{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tenant</label>
            <select {...register("tenantId")} className={inputClass + " cursor-pointer"}>
              <option value="" className="bg-[#2D2D2D]">– kein Tenant –</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#2D2D2D]">{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Passwort */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white">Passwort zurücksetzen</h3>
        <p className="text-xs text-white/40">Leer lassen, um das Passwort unverändert zu behalten.</p>
        <div>
          <label className={labelClass}>Neues Passwort (min. 8 Zeichen)</label>
          <div className="relative">
            <input
              {...register("password")}
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
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Änderungen speichern
        </button>

        {!isSelf && (
          confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Wirklich löschen?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Ja, löschen
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-white/40 hover:text-white text-sm px-3 py-2.5"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm px-4 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              User löschen
            </button>
          )
        )}
      </div>
    </form>
  );
}
