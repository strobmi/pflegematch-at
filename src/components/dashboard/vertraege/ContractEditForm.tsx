"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Pencil, X, Check, Hash } from "lucide-react";
import { updateContract } from "@/app/(dashboard)/vermittler/vertraege/actions";
import type { ContractStatus } from "@prisma/client";

const STATUS_CONFIG: Record<ContractStatus, { label: string; className: string }> = {
  ACTIVE:     { label: "Aktiv",      className: "bg-green-50 text-green-700" },
  TERMINATED: { label: "Gekündigt",  className: "bg-red-50 text-red-600" },
  EXPIRED:    { label: "Abgelaufen", className: "bg-gray-50 text-gray-500" },
};

type ContractData = {
  id: string;
  matchId: string;
  contractNumber: string | null;
  contractNumberCaregiver: string | null;
  contractNumberClient: string | null;
  status: ContractStatus;
  startDate: Date;
  endDate: Date | null;
  noticePeriodDays: number;
  matchFeeAmount: number | null;
  monthlyFeeAmount: number | null;
  notes: string | null;
  caregiverName: string;
  caregiverEmail: string;
  clientName: string;
  clientEmail: string;
  createdAt: Date;
};

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

export default function ContractEditForm({ contract }: { contract: ContractData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  // Form state — contract numbers
  const [contractNumber,          setContractNumber]          = useState(contract.contractNumber          ?? "");
  const [contractNumberCaregiver, setContractNumberCaregiver] = useState(contract.contractNumberCaregiver ?? "");
  const [contractNumberClient,    setContractNumberClient]    = useState(contract.contractNumberClient    ?? "");

  // Form state
  const [startDate, setStartDate]             = useState(toDateInput(contract.startDate));
  const [endDate, setEndDate]                 = useState(toDateInput(contract.endDate));
  const [unbefristet, setUnbefristet]         = useState(contract.endDate === null);
  const [noticePeriodDays, setNoticePeriodDays] = useState(String(contract.noticePeriodDays));
  const [matchFeeAmount, setMatchFeeAmount]   = useState(contract.matchFeeAmount != null ? String(contract.matchFeeAmount) : "");
  const [monthlyFeeAmount, setMonthlyFeeAmount] = useState(contract.monthlyFeeAmount != null ? String(contract.monthlyFeeAmount) : "");
  const [notes, setNotes]                     = useState(contract.notes ?? "");
  const [status, setStatus]                   = useState<ContractStatus>(contract.status);
  const [error, setError]                     = useState<string | null>(null);

  function handleCancel() {
    setContractNumber(contract.contractNumber ?? "");
    setContractNumberCaregiver(contract.contractNumberCaregiver ?? "");
    setContractNumberClient(contract.contractNumberClient ?? "");
    setStartDate(toDateInput(contract.startDate));
    setEndDate(toDateInput(contract.endDate));
    setUnbefristet(contract.endDate === null);
    setNoticePeriodDays(String(contract.noticePeriodDays));
    setMatchFeeAmount(contract.matchFeeAmount != null ? String(contract.matchFeeAmount) : "");
    setMonthlyFeeAmount(contract.monthlyFeeAmount != null ? String(contract.monthlyFeeAmount) : "");
    setNotes(contract.notes ?? "");
    setStatus(contract.status);
    setError(null);
    setIsEditing(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateContract(contract.id, {
        contractNumber:          contractNumber.trim()          || undefined,
        contractNumberCaregiver: contractNumberCaregiver.trim() || undefined,
        contractNumberClient:    contractNumberClient.trim()    || undefined,
        startDate,
        endDate:          unbefristet ? undefined : endDate || undefined,
        noticePeriodDays: Number(noticePeriodDays),
        matchFeeAmount:   matchFeeAmount   !== "" ? Number(matchFeeAmount)   : undefined,
        monthlyFeeAmount: monthlyFeeAmount !== "" ? Number(monthlyFeeAmount) : undefined,
        notes:            notes || undefined,
        status,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  }

  const cfg = STATUS_CONFIG[contract.status];

  return (
    <div className="max-w-2xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-[#2D2D2D]">Vertragsdetails</h1>
          <p className="text-sm text-[#2D2D2D]/55">{contract.caregiverName} · {contract.clientName}</p>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5A7A5A] text-white text-xs font-medium hover:bg-[#4a6a4a] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Speichern
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAD9C8] text-[#2D2D2D] text-xs font-medium hover:bg-[#ddd0c2] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Abbrechen
            </button>
          </div>
        ) : (
          <>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
              {cfg.label}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EAD9C8] text-[#2D2D2D]/60 text-xs font-medium hover:bg-[#FAF6F1] hover:text-[#2D2D2D] transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              Bearbeiten
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Parteien (read-only) */}
      <div className="bg-[#FAF6F1] rounded-2xl border border-[#EAD9C8] px-5 py-4">
        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide mb-3">Parteien</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Pflegekraft</p>
            <p className="font-semibold text-[#2D2D2D]">{contract.caregiverName}</p>
            <p className="text-xs text-[#2D2D2D]/50">{contract.caregiverEmail}</p>
          </div>
          <div>
            <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Klient</p>
            <p className="font-semibold text-[#2D2D2D]">{contract.clientName}</p>
            <p className="text-xs text-[#2D2D2D]/50">{contract.clientEmail}</p>
          </div>
        </div>
      </div>

      {/* Referenznummern */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-3">
        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Referenznummern</p>
        {isEditing ? (
          <div className="grid grid-cols-1 gap-3 text-sm">
            {[
              { label: "Interne Vertragsnummer",      value: contractNumber,          set: setContractNumber,          placeholder: "z. B. VTR-2026-001" },
              { label: "Referenz Pflegekraft",         value: contractNumberCaregiver, set: setContractNumberCaregiver, placeholder: "Nummer im System der Pflegekraft" },
              { label: "Referenz Klient",              value: contractNumberClient,    set: setContractNumberClient,    placeholder: "Nummer im System des Klienten" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs text-[#2D2D2D]/50">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm font-mono focus:outline-none focus:border-[#C06B4A] transition-colors"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              { label: "Intern",      value: contract.contractNumber },
              { label: "Pflegekraft", value: contract.contractNumberCaregiver },
              { label: "Klient",      value: contract.contractNumberClient },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[#2D2D2D]/50 mb-0.5">{label}</p>
                <p className={`font-mono text-sm ${value ? "text-[#C06B4A]" : "text-[#2D2D2D]/30"}`}>
                  {value ?? "–"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Laufzeit */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-3">
        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Laufzeit</p>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs text-[#2D2D2D]/50">Startdatum</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2D2D2D]/50">Enddatum</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-[#2D2D2D]/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unbefristet}
                    onChange={(e) => setUnbefristet(e.target.checked)}
                    className="rounded accent-[#C06B4A]"
                  />
                  Unbefristet
                </label>
                {!unbefristet && (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors"
                  />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2D2D2D]/50">Kündigungsfrist (Tage)</label>
              <input
                type="number"
                min="0"
                value={noticePeriodDays}
                onChange={(e) => setNoticePeriodDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2D2D2D]/50">Erstellt am</label>
              <p className="font-medium text-[#2D2D2D] pt-2">
                {format(new Date(contract.createdAt), "dd. MMMM yyyy", { locale: de })}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Startdatum</p>
              <p className="font-medium text-[#2D2D2D]">
                {format(new Date(contract.startDate), "dd. MMMM yyyy", { locale: de })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Enddatum</p>
              <p className="font-medium text-[#2D2D2D]">
                {contract.endDate
                  ? format(new Date(contract.endDate), "dd. MMMM yyyy", { locale: de })
                  : "Unbefristet"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Kündigungsfrist</p>
              <p className="font-medium text-[#2D2D2D]">{contract.noticePeriodDays} Tage</p>
            </div>
            <div>
              <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Erstellt am</p>
              <p className="font-medium text-[#2D2D2D]">
                {format(new Date(contract.createdAt), "dd. MMMM yyyy", { locale: de })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Gebühren */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-3">
        <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Plattform-Gebühren</p>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs text-[#2D2D2D]/50">Matchgebühr (€, einmalig)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={matchFeeAmount}
                onChange={(e) => setMatchFeeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#2D2D2D]/50">Monatspauschale (€/Monat)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={monthlyFeeAmount}
                onChange={(e) => setMonthlyFeeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Matchgebühr (einmalig)</p>
              <p className="font-semibold text-[#C06B4A]">
                {contract.matchFeeAmount != null ? `€${contract.matchFeeAmount.toFixed(2)}` : "–"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Monatspauschale</p>
              <p className="font-semibold text-[#C06B4A]">
                {contract.monthlyFeeAmount != null ? `€${contract.monthlyFeeAmount.toFixed(2)}/Monat` : "–"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notizen */}
      {isEditing ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-2">
          <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Notizen</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optionale Notizen…"
            className="w-full px-3 py-2 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors resize-none"
          />
        </div>
      ) : contract.notes ? (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-2">
          <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Notizen</p>
          <p className="text-sm text-[#2D2D2D]/70 whitespace-pre-wrap">{contract.notes}</p>
        </div>
      ) : null}

      {/* Status */}
      {isEditing && (
        <div className="bg-white rounded-2xl border border-[#EAD9C8] px-5 py-5 space-y-3">
          <p className="text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</p>
          <div className="flex gap-3">
            {(["ACTIVE", "TERMINATED", "EXPIRED"] as ContractStatus[]).map((s) => {
              const scfg = STATUS_CONFIG[s];
              const selected = status === s;
              return (
                <label
                  key={s}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors ${
                    selected
                      ? "border-[#C06B4A] bg-[#FDF5F0]"
                      : "border-[#EAD9C8] hover:bg-[#FAF6F1]"
                  }`}
                >
                  <input
                    type="radio"
                    name="contract-status"
                    value={s}
                    checked={selected}
                    onChange={() => setStatus(s)}
                    className="accent-[#C06B4A]"
                  />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scfg.className}`}>
                    {scfg.label}
                  </span>
                </label>
              );
            })}
          </div>
          {(status === "TERMINATED" || status === "EXPIRED") && status !== contract.status && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              Der verknüpfte Match wird automatisch auf „Abgeschlossen" gesetzt.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
