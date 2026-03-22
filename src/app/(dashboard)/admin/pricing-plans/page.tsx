"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Tag } from "lucide-react";
import { updatePricingPlan, type PlanFormData } from "./actions";

interface Plan {
  id: string;
  name: string;
  slug: string;
  monthlyFee: number;
  matchFee: number;
  sortOrder: number;
}

export default function PricingPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanFormData>({ name: "", slug: "", monthlyFee: 0, matchFee: 0, sortOrder: 0 });
  const [serverError, setServerError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/admin/pricing-plans").then((r) => r.json()).then(setPlans);
  }, [successId]);

  function startEdit(plan: Plan) {
    setEditId(plan.id);
    setForm({ name: plan.name, slug: plan.slug, monthlyFee: plan.monthlyFee, matchFee: plan.matchFee, sortOrder: plan.sortOrder });
    setServerError(null);
  }

  function save() {
    if (!editId) return;
    startTransition(async () => {
      const result = await updatePricingPlan(editId, form);
      if (result?.error) { setServerError(result.error); return; }
      setSuccessId(editId);
      setEditId(null);
      setTimeout(() => setSuccessId(null), 2000);
    });
  }

  const inputClass = "w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-[#C06B4A] focus:ring-1 focus:ring-[#C06B4A]/20 transition-colors";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Preispläne</h1>
        <p className="text-sm text-white/50 mt-0.5">Matchgebühr und Monatspauschale pro Tarif konfigurieren.</p>
      </div>

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {serverError}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Plan</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Monatspauschale</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Matchgebühr</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {plans.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/30">
                  <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Keine Pläne gefunden
                </td>
              </tr>
            )}
            {plans.map((plan) => {
              const isEditing = editId === plan.id;
              const isSaved   = successId === plan.id;
              return (
                <tr key={plan.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className={inputClass}
                      />
                    ) : (
                      <span className="font-medium text-white">{plan.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.monthlyFee}
                          onChange={(e) => setForm((f) => ({ ...f, monthlyFee: Number(e.target.value) }))}
                          className={inputClass + " pr-7"}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">€</span>
                      </div>
                    ) : (
                      <span className="text-white/70">{plan.monthlyFee} €/Monat</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.matchFee}
                          onChange={(e) => setForm((f) => ({ ...f, matchFee: Number(e.target.value) }))}
                          className={inputClass + " pr-7"}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs">€</span>
                      </div>
                    ) : (
                      <span className="text-white/70">{plan.matchFee} €/Match</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={save}
                          disabled={isPending}
                          className="inline-flex items-center gap-1.5 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                          Speichern
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="text-white/40 hover:text-white text-xs px-2 py-1.5"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(plan)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? "text-[#7B9E7B] bg-[#7B9E7B]/10"
                            : "text-white/40 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {isSaved ? "Gespeichert ✓" : "Bearbeiten"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
