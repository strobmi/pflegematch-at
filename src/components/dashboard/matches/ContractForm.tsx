"use client";

import { useState, useTransition } from "react";
import { createContract } from "@/app/(dashboard)/vermittler/vertraege/actions";

interface ContractFormProps {
  matchId:          string;
  caregiverName:    string;
  clientName:       string;
  defaultMatchFee:  number | null;
  defaultMonthlyFee: number | null;
}

export default function ContractForm({
  matchId,
  caregiverName,
  clientName,
  defaultMatchFee,
  defaultMonthlyFee,
}: ContractFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [contractNumber,          setContractNumber]          = useState("");
  const [contractNumberCaregiver, setContractNumberCaregiver] = useState("");
  const [contractNumberClient,    setContractNumberClient]    = useState("");
  const [startDate,        setStartDate]        = useState(today);
  const [unbefristet,      setUnbefristet]      = useState(true);
  const [endDate,          setEndDate]          = useState("");
  const [noticePeriodDays, setNoticePeriodDays] = useState(14);
  const [notes,            setNotes]            = useState("");
  const [matchFee,         setMatchFee]         = useState(defaultMatchFee ?? "");
  const [monthlyFee,       setMonthlyFee]       = useState(defaultMonthlyFee ?? "");
  const [error,            setError]            = useState<string | null>(null);
  const [isPending,        startTransition]     = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createContract({
        matchId,
        contractNumber:          contractNumber.trim()          || undefined,
        contractNumberCaregiver: contractNumberCaregiver.trim() || undefined,
        contractNumberClient:    contractNumberClient.trim()    || undefined,
        startDate,
        endDate:          unbefristet ? undefined : endDate || undefined,
        noticePeriodDays,
        notes:            notes || undefined,
        matchFeeAmount:   matchFee !== "" ? Number(matchFee) : undefined,
        monthlyFeeAmount: monthlyFee !== "" ? Number(monthlyFee) : undefined,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      {/* Parties summary */}
      <div className="bg-[#FAF6F1] rounded-2xl border border-[#EAD9C8] px-5 py-4 text-sm text-[#2D2D2D]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Pflegekraft</p>
            <p className="font-semibold">{caregiverName}</p>
          </div>
          <div>
            <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Klient</p>
            <p className="font-semibold">{clientName}</p>
          </div>
        </div>
      </div>

      {/* Referenznummern */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-3">
        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">
          Referenznummern <span className="normal-case font-normal text-[#2D2D2D]/40">(optional)</span>
        </p>
        {[
          { label: "Interne Vertragsnummer",  value: contractNumber,          set: setContractNumber,          placeholder: "z. B. VTR-2026-001" },
          { label: "Referenz Pflegekraft",     value: contractNumberCaregiver, set: setContractNumberCaregiver, placeholder: "Nummer im System der Pflegekraft" },
          { label: "Referenz Klient",          value: contractNumberClient,    set: setContractNumberClient,    placeholder: "Nummer im System des Klienten" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs text-[#2D2D2D]/60">{label}</label>
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="w-full text-sm font-mono border border-[#EAD9C8] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
            />
          </div>
        ))}
      </div>

      {/* Laufzeit */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-4">
        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Laufzeit</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-[#2D2D2D]/60">Startdatum *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm border border-[#EAD9C8] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#2D2D2D]/60">Enddatum</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={unbefristet}
                className="flex-1 text-sm border border-[#EAD9C8] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A] disabled:opacity-40"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-[#2D2D2D]/60 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={unbefristet}
                onChange={(e) => setUnbefristet(e.target.checked)}
                className="rounded"
              />
              Unbefristet
            </label>
          </div>
        </div>
        <div className="space-y-1 max-w-xs">
          <label className="text-xs text-[#2D2D2D]/60">Kündigungsfrist (Tage)</label>
          <input
            type="number"
            min={0}
            value={noticePeriodDays}
            onChange={(e) => setNoticePeriodDays(Number(e.target.value))}
            className="w-full text-sm border border-[#EAD9C8] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
          />
        </div>
      </div>

      {/* Gebühren */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-4">
        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Plattform-Gebühren</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-[#2D2D2D]/60">Matchgebühr (€, einmalig)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#2D2D2D]/40">€</span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={matchFee}
                onChange={(e) => setMatchFee(e.target.value)}
                className="w-full pl-7 text-sm border border-[#EAD9C8] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#2D2D2D]/60">Monatspauschale (€/Monat)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#2D2D2D]/40">€</span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                className="w-full pl-7 text-sm border border-[#EAD9C8] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A]"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-[#2D2D2D]/40">Vorausgefüllt mit den Standardgebühren des Tenants. Du kannst die Werte für diesen Vertrag anpassen.</p>
      </div>

      {/* Notizen */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-2">
        <label className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">
          Notizen (intern)
        </label>
        <textarea
          rows={3}
          placeholder="Interne Notizen zum Vertrag…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-sm border border-[#EAD9C8] rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#C06B4A] resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!startDate || isPending}
        className="w-full bg-[#C06B4A] hover:bg-[#A05438] text-white font-semibold rounded-xl px-6 py-3 transition-colors disabled:opacity-40"
      >
        {isPending ? "Wird gespeichert…" : "Vertrag anlegen & Match aktivieren"}
      </button>
    </div>
  );
}
