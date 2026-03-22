"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Tag } from "lucide-react";

const schema = z.object({
  tenantName:        z.string().min(2, "Min. 2 Zeichen"),
  tenantSlug:        z.string().min(2, "Min. 2 Zeichen").regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  tenantEmail:       z.string().email("Ungültige E-Mail"),
  tenantPhone:       z.string().optional(),
  tenantAddress:     z.string().optional(),
  status:            z.enum(["ACTIVE", "PENDING", "SUSPENDED"]),
  defaultMatchFee:   z.coerce.number().min(0).optional().nullable(),
  defaultMonthlyFee: z.coerce.number().min(0).optional().nullable(),
});

type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS = [
  { value: "ACTIVE",    label: "Aktiv" },
  { value: "PENDING",   label: "Ausstehend" },
  { value: "SUSPENDED", label: "Gesperrt" },
];

interface PlanOption {
  id: string;
  name: string;
  slug: string;
  monthlyFee: number;
  matchFee: number;
}

interface Props {
  tenantId: string;
  defaultValues: Partial<FormData>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (tenantId: string, data: FormData) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete: (tenantId: string) => Promise<any>;
  allPlans?: PlanOption[];
  activePlan?: { name: string; monthlyFee: number; matchFee: number } | null;
  pendingPlan?: { name: string; effectiveFrom: string } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAssignPlan?: (tenantId: string, data: { planId: string; effectiveFrom: string }) => Promise<any>;
}

function firstOfNextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  return d.toISOString().split("T")[0];
}

export default function TenantEditForm({ tenantId, defaultValues, onSubmit, onDelete, allPlans, activePlan, pendingPlan, onAssignPlan }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(firstOfNextMonth);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState(false);
  const [isPlanPending, startPlanTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData>({ resolver: standardSchemaResolver(schema) as any, defaultValues });

  async function submit(data: FormData) {
    setServerError(null);
    const result = await onSubmit(tenantId, data);
    if (result?.error) setServerError(result.error);
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await onDelete(tenantId);
    if (result?.error) { setServerError(result.error); setDeleting(false); return; }
    router.push("/admin/tenants");
  }

  function handleAssignPlan() {
    if (!onAssignPlan || !selectedPlanId) return;
    setPlanError(null);
    startPlanTransition(async () => {
      const result = await onAssignPlan(tenantId, { planId: selectedPlanId, effectiveFrom });
      if (result?.error) { setPlanError(result.error); return; }
      setPlanSuccess(true);
      setSelectedPlanId("");
      setTimeout(() => { setPlanSuccess(false); router.refresh(); }, 1500);
    });
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
            <input {...register("tenantName")} className={inputClass} />
            {errors.tenantName && <p className={errorClass}>{errors.tenantName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input {...register("tenantSlug")} className={inputClass} />
            {errors.tenantSlug && <p className={errorClass}>{errors.tenantSlug.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input {...register("tenantEmail")} type="email" className={inputClass} />
            {errors.tenantEmail && <p className={errorClass}>{errors.tenantEmail.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input {...register("tenantPhone")} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Adresse</label>
          <input {...register("tenantAddress")} className={inputClass} />
        </div>

        <div className="max-w-xs">
          <label className={labelClass}>Status</label>
          <select {...register("status")} className={inputClass + " cursor-pointer"}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#2D2D2D]">{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gebühren */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-white">Plattform-Gebühren</h3>
          <p className="text-xs text-white/40 mt-0.5">Vorausgefüllte Standardwerte beim Vertragsabschluss — Vermittler kann pro Vertrag anpassen.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Matchgebühr (€, einmalig)</label>
            <div className="relative">
              <input
                {...register("defaultMatchFee")}
                type="number"
                min="0"
                step="1"
                placeholder="z.B. 200"
                className={inputClass + " pr-8"}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">€</span>
            </div>
            {errors.defaultMatchFee && <p className={errorClass}>{errors.defaultMatchFee.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Monatspauschale (€/Monat)</label>
            <div className="relative">
              <input
                {...register("defaultMonthlyFee")}
                type="number"
                min="0"
                step="1"
                placeholder="z.B. 30"
                className={inputClass + " pr-8"}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">€</span>
            </div>
            {errors.defaultMonthlyFee && <p className={errorClass}>{errors.defaultMonthlyFee.message}</p>}
          </div>
        </div>
      </div>

      {/* Preisplan */}
      {allPlans && allPlans.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-white/40" />
            <h3 className="font-semibold text-white">Preisplan</h3>
          </div>

          {/* Aktiver Plan */}
          {activePlan ? (
            <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 mb-0.5">Aktiver Plan</p>
                <p className="font-medium text-white">{activePlan.name}</p>
              </div>
              <div className="text-right text-sm text-white/60">
                <p>{activePlan.monthlyFee} €/Monat</p>
                <p>{activePlan.matchFee} €/Match</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/40">Kein Plan zugewiesen — manuelle Gebühren gelten.</p>
          )}

          {/* Ausstehender Planwechsel */}
          {pendingPlan && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
              Wechsel zu <span className="font-semibold">{pendingPlan.name}</span> ab{" "}
              {new Date(pendingPlan.effectiveFrom).toLocaleDateString("de-AT")}
            </div>
          )}

          {/* Neuen Plan zuweisen */}
          {planError && (
            <p className="text-xs text-red-400">{planError}</p>
          )}
          {planSuccess && (
            <p className="text-xs text-[#7B9E7B]">Plan-Wechsel gespeichert ✓</p>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Neuer Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className={inputClass + " cursor-pointer"}
              >
                <option value="" className="bg-[#2D2D2D]">— Plan wählen —</option>
                {allPlans.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#2D2D2D]">
                    {p.name} ({p.monthlyFee} €/Mo + {p.matchFee} €/Match)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Stichtag</label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAssignPlan}
            disabled={!selectedPlanId || isPlanPending}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {isPlanPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Plan zuweisen
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Änderungen speichern
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Wirklich löschen? Alle Daten gehen verloren.</span>
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
            Vermittler löschen
          </button>
        )}
      </div>
    </form>
  );
}
