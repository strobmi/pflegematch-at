"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, X, Calendar } from "lucide-react";
import { createAnfrage } from "@/app/(dashboard)/vermittler/anfragen/actions";

const ic = "w-full px-3 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/10 transition-colors placeholder:text-[#2D2D2D]/35";
const sc = "w-full px-3 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors text-[#2D2D2D]";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-[#2D2D2D]/55 mb-1.5 uppercase tracking-wide">{children}</label>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5 space-y-4">
      <h2 className="text-sm font-bold text-[#2D2D2D]">{title}</h2>
      {children}
    </div>
  );
}

const LANGUAGES = ["Deutsch", "Kroatisch", "Slowakisch", "Ungarisch", "Rumänisch", "Englisch"];
const LEVELS = [
  { value: "grundkenntnisse", label: "Grundkenntnisse" },
  { value: "fliessend",       label: "Fließend" },
  { value: "muttersprache",   label: "Muttersprache" },
];

const emptySlot = () => ({ date: "", time: "", durationMin: 60 as 30 | 60 });

export default function AnfrageCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [sprachen, setSprachen] = useState<Array<{ lang: string; level: string }>>([]);
  const [slotInputs, setSlotInputs] = useState([emptySlot(), emptySlot(), emptySlot()]);

  function updateSlot(index: number, field: "date" | "time" | "durationMin", value: string | number) {
    setSlotInputs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function toggleSprache(lang: string) {
    setSprachen((prev) =>
      prev.find((s) => s.lang === lang)
        ? prev.filter((s) => s.lang !== lang)
        : [...prev, { lang, level: "fliessend" }]
    );
  }

  function setLevel(lang: string, level: string) {
    setSprachen((prev) => prev.map((s) => (s.lang === lang ? { ...s, level } : s)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const wunschtermine = slotInputs
      .filter((s) => s.date && s.time)
      .map((s) => ({ dateTime: `${s.date}T${s.time}:00`, durationMin: s.durationMin }));
    try {
      await createAnfrage({
        contactName:   fd.get("contactName") as string,
        contactEmail:  fd.get("contactEmail") as string,
        contactPhone:  (fd.get("contactPhone") as string) || undefined,
        fuerWen:       (fd.get("fuerWen") as string) || undefined,
        betreuungsart: (fd.get("betreuungsart") as string) || undefined,
        pflegestufe:   (fd.get("pflegestufe") as string) || undefined,
        mobilitaet:    (fd.get("mobilitaet") as string) || undefined,
        demenz:        (fd.get("demenz") as string) || undefined,
        unterkunft:    (fd.get("unterkunft") as string) || undefined,
        startZeit:     (fd.get("startZeit") as string) || undefined,
        dauer:         (fd.get("dauer") as string) || undefined,
        ort:           (fd.get("ort") as string) || undefined,
        sprachen,
        notes:         (fd.get("notes") as string) || undefined,
        wunschtermine: wunschtermine.length > 0 ? wunschtermine : undefined,
      });
    } catch (err) {
      // Re-throw Next.js redirect errors so they are handled correctly
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      if (typeof err === "object" && err !== null && "digest" in err) throw err;
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">

      {/* Kontakt */}
      <Section title="Kontaktdaten">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Name *</Label>
            <input name="contactName" required placeholder="Vor- und Nachname" className={ic} />
          </div>
          <div>
            <Label>E-Mail *</Label>
            <input name="contactEmail" type="email" required placeholder="email@beispiel.at" className={ic} />
          </div>
          <div>
            <Label>Telefon</Label>
            <input name="contactPhone" type="tel" placeholder="+43 …" className={ic} />
          </div>
        </div>
      </Section>

      {/* Für wen */}
      <Section title="Für wen wird Pflege gesucht?">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: "ich",        label: "Für sich selbst" },
            { value: "elternteil", label: "Mutter / Vater" },
            { value: "partner",    label: "Partner/-in" },
            { value: "andere",     label: "Jemand anderen" },
          ].map((o) => (
            <label key={o.value} className="relative cursor-pointer">
              <input type="radio" name="fuerWen" value={o.value} className="peer sr-only" />
              <div className="p-3 rounded-xl border-2 border-[#EAD9C8] text-center text-sm text-[#2D2D2D]/60 peer-checked:border-[#C06B4A] peer-checked:bg-[#FDF5F0] peer-checked:text-[#C06B4A] peer-checked:font-semibold transition-all">
                {o.label}
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Betreuungsart + Pflegestufe */}
      <Section title="Pflegebedarf">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Betreuungsart</Label>
            <select name="betreuungsart" className={sc}>
              <option value="">– bitte wählen –</option>
              <option value="24h">24h-Pflege</option>
              <option value="stundenweise">Stundenweise</option>
              <option value="tagesbetreuung">Tagesbetreuung</option>
              <option value="nachtsitzung">Nachtsitzung</option>
            </select>
          </div>
          <div>
            <Label>Pflegestufe</Label>
            <select name="pflegestufe" className={sc}>
              <option value="">– bitte wählen –</option>
              <option value="keine">Kein Pflegegeld</option>
              <option value="stufe_1">Pflegestufe 1</option>
              <option value="stufe_2">Pflegestufe 2</option>
              <option value="stufe_3">Pflegestufe 3</option>
              <option value="stufe_45">Pflegestufe 4–5</option>
              <option value="unbekannt">Noch unbekannt</option>
            </select>
          </div>
          <div>
            <Label>Mobilität</Label>
            <select name="mobilitaet" className={sc}>
              <option value="">– bitte wählen –</option>
              <option value="selbstaendig">Selbständig</option>
              <option value="mit_hilfe">Mit Unterstützung</option>
              <option value="rollstuhl">Rollstuhlfahrer/-in</option>
              <option value="bettlaegerig">Bettlägerig</option>
            </select>
          </div>
          <div>
            <Label>Demenz</Label>
            <select name="demenz" className={sc}>
              <option value="">– bitte wählen –</option>
              <option value="nein">Nein</option>
              <option value="leicht">Leichte Anzeichen</option>
              <option value="ja">Ja, diagnostiziert</option>
            </select>
          </div>
          <div>
            <Label>Unterkunft für Pflegekraft</Label>
            <select name="unterkunft" className={sc}>
              <option value="">– bitte wählen –</option>
              <option value="ja">Ja, eigenes Zimmer vorhanden</option>
              <option value="nein">Nein, externe Unterkunft nötig</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Zeitplan */}
      <Section title="Zeitplanung">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Ab wann?</Label>
            <select name="startZeit" className={sc}>
              <option value="">– bitte wählen –</option>
              <option value="sofort">So bald wie möglich</option>
              <option value="ein_zwei_wochen">In 1–2 Wochen</option>
              <option value="ein_monat">In ca. 1 Monat</option>
              <option value="unklar">Noch nicht bekannt</option>
            </select>
          </div>
          <div>
            <Label>Wie lange?</Label>
            <select name="dauer" className={sc}>
              <option value="">– bitte wählen –</option>
              <option value="dauerhaft">Dauerhaft</option>
              <option value="monate">Mehrere Monate</option>
              <option value="wochen">Einige Wochen</option>
              <option value="unklar">Noch nicht bekannt</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Sprache & Standort */}
      <Section title="Sprache & Standort">
        <div>
          <Label>Ort / PLZ</Label>
          <input name="ort" placeholder="z.B. Wien oder 1010" className={ic} />
        </div>
        <div>
          <Label>Gewünschte Sprache(n) der Pflegekraft</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {LANGUAGES.map((lang) => {
              const selected = !!sprachen.find((s) => s.lang === lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleSprache(lang)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
                    selected
                      ? "border-[#C06B4A] bg-[#C06B4A] text-white"
                      : "border-[#EAD9C8] text-[#2D2D2D]/60 hover:border-[#C06B4A]/40"
                  }`}
                >
                  {selected && <Check className="w-3 h-3" strokeWidth={3} />}
                  {lang}
                </button>
              );
            })}
          </div>
          {sprachen.length > 0 && (
            <div className="space-y-2">
              {sprachen.map(({ lang, level }) => (
                <div key={lang} className="flex items-center gap-3 bg-[#FAF6F1] rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSprache(lang)}
                      className="text-[#2D2D2D]/30 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold text-[#2D2D2D]">{lang}</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setLevel(lang, l.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          level === l.value
                            ? "bg-[#C06B4A] border-[#C06B4A] text-white"
                            : "border-[#EAD9C8] text-[#2D2D2D]/55 hover:border-[#C06B4A]/40"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Wunschtermine */}
      <Section title="Wunschtermine für Kennenlerngespräch (optional)">
        {(() => {
          const today = new Date();
          today.setDate(today.getDate() + 1);
          const minDate = today.toISOString().split("T")[0];
          return (
            <div className="space-y-3">
              {slotInputs.map((slot, i) => (
                <div key={i} className="space-y-1">
                  <label className="block text-xs font-medium text-[#2D2D2D]/50">{i + 1}. Wunschtermin</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={slot.date}
                      min={minDate}
                      onChange={(e) => updateSlot(i, "date", e.target.value)}
                      className={ic}
                    />
                    <input
                      type="time"
                      value={slot.time}
                      disabled={!slot.date}
                      onChange={(e) => updateSlot(i, "time", e.target.value)}
                      className={`${ic} w-32 disabled:opacity-40`}
                    />
                    <select
                      value={slot.durationMin}
                      disabled={!slot.date}
                      onChange={(e) => updateSlot(i, "durationMin", Number(e.target.value))}
                      className={`${sc} w-28 disabled:opacity-40`}
                    >
                      <option value={30}>30 Min.</option>
                      <option value={60}>60 Min.</option>
                    </select>
                  </div>
                </div>
              ))}
              <p className="text-xs text-[#2D2D2D]/40 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Frühestens morgen · max. ein Termin pro Tag
              </p>
            </div>
          );
        })()}
      </Section>

      {/* Notizen */}
      <Section title="Persönliche Nachricht / Notizen">
        <textarea
          name="notes"
          rows={3}
          placeholder="Was ist besonders wichtig? Interne Anmerkungen…"
          className={`${ic} resize-none`}
        />
      </Section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Anfrage erstellen
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-[#2D2D2D]/50 hover:text-[#2D2D2D] transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
