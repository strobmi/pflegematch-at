"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check } from "lucide-react";
import { createMatch } from "@/app/(dashboard)/vermittler/matches/actions";
import type { CaregiverProfile, ClientProfile, User } from "@prisma/client";

type PflegerItem = CaregiverProfile & { user: Pick<User, "name"> };
type KlientItem  = ClientProfile  & { user: Pick<User, "name"> };

const schema = z.object({
  caregiverProfileId: z.string().min(1, "Pflegekraft wählen"),
  clientProfileId:    z.string().min(1, "Klient wählen"),
  score:    z.coerce.number().min(0).max(100).optional(),
  notes:    z.string().optional(),
  startDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const AVAILABILITY_LABELS: Record<string, string> = {
  FULL_TIME: "Vollzeit", PART_TIME: "Teilzeit",
  HOURLY: "Stundenweise", LIVE_IN: "24h",
};

export default function MatchCreateForm({
  pflegekraefte,
  klienten,
}: {
  pflegekraefte: PflegerItem[];
  klienten: KlientItem[];
}) {
  const [selectedPfleger, setSelectedPfleger] = useState<string | null>(null);
  const [selectedKlient, setSelectedKlient]   = useState<string | null>(null);
  const [pflegerSearch, setPflegerSearch] = useState("");
  const [klientSearch,  setKlientSearch]  = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  function selectPfleger(id: string) {
    setSelectedPfleger(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("caregiverProfileId" as any, id);
  }

  function selectKlient(id: string) {
    setSelectedKlient(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("clientProfileId" as any, id);
  }

  const filteredPfleger = pflegekraefte.filter((p) =>
    p.user.name?.toLowerCase().includes(pflegerSearch.toLowerCase())
  );
  const filteredKlienten = klienten.filter((k) =>
    k.user.name?.toLowerCase().includes(klientSearch.toLowerCase())
  );

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors placeholder:text-[#2D2D2D]/35";

  return (
    <form onSubmit={handleSubmit(createMatch)} className="space-y-6">
      {/* Two-panel selector */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pfleger panel */}
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-4">
          <h3 className="font-semibold text-[#2D2D2D] mb-3">Pflegekraft auswählen</h3>
          <input
            value={pflegerSearch}
            onChange={(e) => setPflegerSearch(e.target.value)}
            placeholder="Suchen..."
            className={`${inputClass} mb-3`}
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredPfleger.length === 0 && (
              <p className="text-sm text-[#2D2D2D]/40 text-center py-4">Keine aktiven Pflegekräfte</p>
            )}
            {filteredPfleger.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPfleger(p.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                  selectedPfleger === p.id
                    ? "border-[#C06B4A] bg-[#F5EDE3]"
                    : "border-[#EAD9C8] hover:border-[#C06B4A]/50 hover:bg-[#FAF6F1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#2D2D2D]">{p.user.name}</p>
                    <p className="text-xs text-[#2D2D2D]/50">
                      {p.locationCity ?? "–"} · {AVAILABILITY_LABELS[p.availability]}
                    </p>
                  </div>
                  {selectedPfleger === p.id && (
                    <Check className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.caregiverProfileId && (
            <p className="text-xs text-red-500 mt-2">{errors.caregiverProfileId.message}</p>
          )}
          <input type="hidden" {...register("caregiverProfileId")} />
        </div>

        {/* Klient panel */}
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-4">
          <h3 className="font-semibold text-[#2D2D2D] mb-3">Klient auswählen</h3>
          <input
            value={klientSearch}
            onChange={(e) => setKlientSearch(e.target.value)}
            placeholder="Suchen..."
            className={`${inputClass} mb-3`}
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredKlienten.length === 0 && (
              <p className="text-sm text-[#2D2D2D]/40 text-center py-4">Keine aktiven Klienten</p>
            )}
            {filteredKlienten.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => selectKlient(k.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                  selectedKlient === k.id
                    ? "border-[#7B9E7B] bg-[#F0F7F0]"
                    : "border-[#EAD9C8] hover:border-[#7B9E7B]/50 hover:bg-[#FAF6F1]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#2D2D2D]">{k.user.name}</p>
                    <p className="text-xs text-[#2D2D2D]/50">
                      {k.locationCity ?? "–"}
                      {k.pflegegeldStufe && ` · ${k.pflegegeldStufe.replace("STUFE_", "Stufe ")}`}
                    </p>
                  </div>
                  {selectedKlient === k.id && (
                    <Check className="w-4 h-4 text-[#7B9E7B] flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.clientProfileId && (
            <p className="text-xs text-red-500 mt-2">{errors.clientProfileId.message}</p>
          )}
          <input type="hidden" {...register("clientProfileId")} />
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
        <h3 className="font-semibold text-[#2D2D2D] mb-4">Match-Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">
              Matching-Score (0–100)
            </label>
            <input
              type="number"
              min={0} max={100}
              {...register("score")}
              placeholder="z.B. 85"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">
              Geplanter Starttermin
            </label>
            <input type="date" {...register("startDate")} className={inputClass} />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Notizen</label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Interne Notizen zum Match..."
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !selectedPfleger || !selectedKlient}
        className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Match erstellen
      </button>
    </form>
  );
}
