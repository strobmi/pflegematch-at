"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Check, Loader2, CheckCircle, Calendar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  fuerWen: string;
  betreuungsart: string;
  pflegestufe: string;
  mobilitaet: string;
  demenz: string;
  unterkunft: string;
  startZeit: string;
  dauer: string;
  sprachen: Array<{ lang: string; level: string }>;
  ort: string;
  prioritaeten: string;
  name: string;
  email: string;
  telefon: string;
}

const initialData: FormData = {
  fuerWen: "",
  betreuungsart: "",
  pflegestufe: "",
  mobilitaet: "",
  demenz: "",
  unterkunft: "",
  startZeit: "",
  dauer: "",
  sprachen: [],
  ort: "",
  prioritaeten: "",
  name: "",
  email: "",
  telefon: "",
};

const TOTAL_STEPS = 10;

// ─── Option Card ──────────────────────────────────────────────────────────────

function OptionCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer ${
        selected
          ? "border-[#C06B4A] bg-[#FDF5F0] shadow-md shadow-[#C06B4A]/10"
          : "border-[#EAD9C8] bg-white hover:border-[#C06B4A]/50 hover:bg-[#FAF6F1]"
      }`}
    >
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#C06B4A] rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold text-[#2D2D2D] text-sm leading-tight">{label}</div>
      {description && (
        <div className="text-[11px] text-[#2D2D2D]/50 mt-1 leading-snug">{description}</div>
      )}
    </button>
  );
}

// ─── Row Option (for step 5) ──────────────────────────────────────────────────

function RowOption({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-150 cursor-pointer ${
        selected
          ? "border-[#C06B4A] bg-[#FDF5F0] shadow-md shadow-[#C06B4A]/10"
          : "border-[#EAD9C8] bg-white hover:border-[#C06B4A]/50 hover:bg-[#FAF6F1]"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors ${
          selected ? "bg-[#C06B4A] text-white" : "bg-[#FAF6F1] text-[#C06B4A]"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[#2D2D2D] text-sm">{label}</div>
        <div className="text-[11px] text-[#2D2D2D]/50 mt-0.5 leading-snug">{description}</div>
      </div>
      {selected && <Check className="w-5 h-5 text-[#C06B4A] shrink-0" />}
    </button>
  );
}

// ─── Chip Button ──────────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 cursor-pointer ${
        selected
          ? "border-[#C06B4A] bg-[#C06B4A] text-white shadow-sm"
          : "border-[#EAD9C8] text-[#2D2D2D]/70 hover:border-[#C06B4A]/50 hover:bg-[#FAF6F1]"
      }`}
    >
      {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      {label}
    </button>
  );
}

// ─── Mini Select Pill ─────────────────────────────────────────────────────────

function SelectPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
        selected
          ? "border-[#C06B4A] bg-[#FDF5F0] text-[#C06B4A]"
          : "border-[#EAD9C8] text-[#2D2D2D]/65 hover:border-[#C06B4A]/50 hover:bg-[#FAF6F1]"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder + (required ? " *" : "")}
      className="w-full px-4 py-3 rounded-xl border-2 border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/15 transition-colors placeholder:text-[#2D2D2D]/35"
    />
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -56 : 56, opacity: 0 }),
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const emptySlot = () => ({ date: "", time: "", durationMin: 60 as 30 | 60 });

export default function FragebogenModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [data, setData] = useState<FormData>(initialData);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; telefon?: string }>({});
  const [slotInputs, setSlotInputs] = useState([emptySlot(), emptySlot(), emptySlot()]);
  const [slotError, setSlotError] = useState<string | null>(null);

  const progress = (step / TOTAL_STEPS) * 100;

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function selectAndAdvance<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setTimeout(goNext, 160);
  }

  function selectZeitplanField(key: "startZeit" | "dauer", value: string) {
    setData((d) => {
      const updated = { ...d, [key]: value };
      if (updated.startZeit && updated.dauer) {
        setTimeout(goNext, 160);
      }
      return updated;
    });
  }

  function toggleSprache(lang: string) {
    setData((d) => {
      const exists = d.sprachen.find((s) => s.lang === lang);
      return {
        ...d,
        sprachen: exists
          ? d.sprachen.filter((s) => s.lang !== lang)
          : [...d.sprachen, { lang, level: "fliessend" }],
      };
    });
  }

  function setSpracheLevel(lang: string, level: string) {
    setData((d) => ({
      ...d,
      sprachen: d.sprachen.map((s) => (s.lang === lang ? { ...s, level } : s)),
    }));
  }

  function updateSlot(index: number, field: "date" | "time" | "durationMin", value: string | number) {
    setSlotInputs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
    setSlotError(null);
  }

  function validateSlots(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filledSlots = slotInputs.filter((s) => s.date || s.time);
    for (const slot of filledSlots) {
      if (!slot.date || !slot.time) {
        setSlotError("Bitte Datum und Uhrzeit für jeden angegebenen Termin ausfüllen.");
        return false;
      }
      const d = new Date(slot.date);
      if (d < tomorrow) {
        setSlotError("Wunschtermine müssen mindestens am nächsten Tag liegen.");
        return false;
      }
    }

    const dates = filledSlots.map((s) => s.date).filter(Boolean);
    const uniqueDates = new Set(dates);
    if (uniqueDates.size < dates.length) {
      setSlotError("Pro Tag ist nur ein Wunschtermin erlaubt.");
      return false;
    }

    setSlotError(null);
    return true;
  }

  /** Validates contact fields then advances from step 9 → 10 */
  function handleContactWeiter() {
    if (!data.name.trim() || !data.email.trim()) return;

    const errors: { email?: string; telefon?: string } = {};
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
    if (!emailValid) errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    const telefonRaw = data.telefon.trim();
    if (telefonRaw && !/^[+\d][\d\s\-().]{5,}$/.test(telefonRaw))
      errors.telefon = "Bitte geben Sie eine gültige Telefonnummer ein.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    goNext();
  }

  async function handleSubmit() {
    if (!validateSlots()) return;

    const wunschtermine = slotInputs
      .filter((s) => s.date && s.time)
      .map((s) => ({ dateTime: `${s.date}T${s.time}:00`, durationMin: s.durationMin }));

    setStatus("loading");
    try {
      const res = await fetch("/api/fragebogen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, wunschtermine }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setStep(1);
      setData(initialData);
      setStatus("idle");
      setDirection(1);
      setFieldErrors({});
      setSlotInputs([emptySlot(), emptySlot(), emptySlot()]);
      setSlotError(null);
    }, 300);
  }

  // ── Steps ────────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ── 1: Für wen? ───────────────────────────────────────────────────────────
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">Für wen suchen Sie?</h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Erzählen Sie uns kurz, für wen die Pflegekraft sein soll.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "ich", icon: "🙋", label: "Für mich selbst" },
                { value: "elternteil", icon: "👴", label: "Für Mutter / Vater" },
                { value: "partner", icon: "💑", label: "Für Partner/-in" },
                { value: "andere", icon: "👤", label: "Für jemand anderen" },
              ].map((o) => (
                <OptionCard
                  key={o.value}
                  icon={o.icon}
                  label={o.label}
                  selected={data.fuerWen === o.value}
                  onClick={() => selectAndAdvance("fuerWen", o.value)}
                />
              ))}
            </div>
          </div>
        );

      // ── 2: Betreuungsart ──────────────────────────────────────────────────────
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">Welche Betreuung wird benötigt?</h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Wählen Sie die Betreuungsform, die am besten passt.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "24h", icon: "🏠", label: "24h-Pflege", description: "Rund-um-die-Uhr im Haushalt" },
                { value: "stundenweise", icon: "⏰", label: "Stundenweise", description: "Regelmäßige Besuche" },
                { value: "tagesbetreuung", icon: "☀️", label: "Tagesbetreuung", description: "Betreuung tagsüber" },
                { value: "nachtsitzung", icon: "🌙", label: "Nachtsitzung", description: "Nächtliche Begleitung" },
              ].map((o) => (
                <OptionCard
                  key={o.value}
                  icon={o.icon}
                  label={o.label}
                  description={o.description}
                  selected={data.betreuungsart === o.value}
                  onClick={() => selectAndAdvance("betreuungsart", o.value)}
                />
              ))}
            </div>
          </div>
        );

      // ── 3: Pflegestufe ────────────────────────────────────────────────────────
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">
              Liegt eine Pflegegeld-Einstufung vor?
            </h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Das Pflegegeld bestimmt den Betreuungsumfang.
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { value: "keine", badge: "–", label: "Kein Pflegegeld", sub: "Noch nicht beantragt" },
                { value: "stufe_1", badge: "1", label: "Pflegestufe 1", sub: "Geringer Bedarf" },
                { value: "stufe_2", badge: "2", label: "Pflegestufe 2", sub: "Mittlerer Bedarf" },
                { value: "stufe_3", badge: "3", label: "Pflegestufe 3", sub: "Erhöhter Bedarf" },
                { value: "stufe_45", badge: "4–5", label: "Pflegestufe 4–5", sub: "Schwerer Bedarf" },
                { value: "unbekannt", badge: "?", label: "Weiß noch nicht", sub: "" },
              ].map((o) => (
                <button
                  key={o.value}
                  onClick={() => selectAndAdvance("pflegestufe", o.value)}
                  className={`relative text-left p-3 rounded-2xl border-2 transition-all duration-150 cursor-pointer ${
                    data.pflegestufe === o.value
                      ? "border-[#C06B4A] bg-[#FDF5F0] shadow-md shadow-[#C06B4A]/10"
                      : "border-[#EAD9C8] bg-white hover:border-[#C06B4A]/50 hover:bg-[#FAF6F1]"
                  }`}
                >
                  {data.pflegestufe === o.value && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-[#C06B4A] rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="text-lg font-bold text-[#C06B4A] mb-1 leading-none">{o.badge}</div>
                  <div className="font-semibold text-[#2D2D2D] text-xs leading-tight">{o.label}</div>
                  {o.sub && (
                    <div className="text-[10px] text-[#2D2D2D]/45 mt-0.5 leading-snug">{o.sub}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      // ── 4: Mobilität ──────────────────────────────────────────────────────────
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">Wie ist die Mobilität?</h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Das hilft uns, die passende Pflegekraft zu finden.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "selbstaendig", icon: "🚶", label: "Selbständig", description: "Fortbewegung eigenständig möglich" },
                { value: "mit_hilfe", icon: "🤝", label: "Mit Unterstützung", description: "Hilfe beim Aufstehen / Gehen nötig" },
                { value: "rollstuhl", icon: "♿", label: "Rollstuhlfahrer/-in", description: "Dauerhaft auf Rollstuhl angewiesen" },
                { value: "bettlaegerig", icon: "🛏️", label: "Bettlägerig", description: "Pflege hauptsächlich im Bett" },
              ].map((o) => (
                <OptionCard
                  key={o.value}
                  icon={o.icon}
                  label={o.label}
                  description={o.description}
                  selected={data.mobilitaet === o.value}
                  onClick={() => selectAndAdvance("mobilitaet", o.value)}
                />
              ))}
            </div>
          </div>
        );

      // ── 5: Demenz ─────────────────────────────────────────────────────────────
      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">
              Liegt eine Demenzerkrankung vor?
            </h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Speziell geschulte Pflegekräfte können gezielt eingesetzt werden.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { value: "nein", icon: "✓", label: "Nein", description: "Keine kognitiven Einschränkungen bekannt" },
                { value: "leicht", icon: "◐", label: "Leichte Anzeichen", description: "Gelegentliche Vergesslichkeit oder Orientierungsprobleme" },
                { value: "ja", icon: "!", label: "Ja, diagnostiziert", description: "Ärztliche Diagnose liegt vor" },
              ].map((o) => (
                <RowOption
                  key={o.value}
                  icon={o.icon}
                  label={o.label}
                  description={o.description}
                  selected={data.demenz === o.value}
                  onClick={() => selectAndAdvance("demenz", o.value)}
                />
              ))}
            </div>
          </div>
        );

      // ── 6: Unterkunft ─────────────────────────────────────────────────────────
      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">
              Gibt es eine Unterkunft für die Pflegekraft?
            </h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Besonders wichtig bei 24h-Betreuung.
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  value: "ja",
                  icon: "🏠",
                  label: "Ja, ein eigenes Zimmer ist vorhanden",
                  description: "Die Pflegekraft kann direkt im Haushalt wohnen",
                },
                {
                  value: "nein",
                  icon: "🏢",
                  label: "Nein, externe Unterkunft nötig",
                  description: "Wir helfen bei der Suche nach einer Lösung",
                },
              ].map((o) => (
                <button
                  key={o.value}
                  onClick={() => selectAndAdvance("unterkunft", o.value)}
                  className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-150 cursor-pointer ${
                    data.unterkunft === o.value
                      ? "border-[#C06B4A] bg-[#FDF5F0] shadow-md shadow-[#C06B4A]/10"
                      : "border-[#EAD9C8] bg-white hover:border-[#C06B4A]/50 hover:bg-[#FAF6F1]"
                  }`}
                >
                  {data.unterkunft === o.value && (
                    <div className="absolute top-3.5 right-3.5 w-5 h-5 bg-[#C06B4A] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="text-2xl mb-2">{o.icon}</div>
                  <div className="font-semibold text-[#2D2D2D]">{o.label}</div>
                  <div className="text-sm text-[#2D2D2D]/50 mt-1">{o.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      // ── 7: Zeitplan ───────────────────────────────────────────────────────────
      case 7:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">Zeitplanung</h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Wann und für wie lange benötigen Sie die Pflegekraft?
            </p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-[#2D2D2D] mb-2.5 block">Ab wann?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "sofort", label: "So bald wie möglich" },
                    { value: "ein_zwei_wochen", label: "In 1–2 Wochen" },
                    { value: "ein_monat", label: "In ca. 1 Monat" },
                    { value: "unklar", label: "Noch nicht bekannt" },
                  ].map((o) => (
                    <SelectPill
                      key={o.value}
                      label={o.label}
                      selected={data.startZeit === o.value}
                      onClick={() => selectZeitplanField("startZeit", o.value)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-[#2D2D2D] mb-2.5 block">Wie lange?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "dauerhaft", label: "Dauerhaft" },
                    { value: "monate", label: "Mehrere Monate" },
                    { value: "wochen", label: "Einige Wochen" },
                    { value: "unklar", label: "Noch nicht bekannt" },
                  ].map((o) => (
                    <SelectPill
                      key={o.value}
                      label={o.label}
                      selected={data.dauer === o.value}
                      onClick={() => selectZeitplanField("dauer", o.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // ── 8: Sprache & Standort ─────────────────────────────────────────────────
      case 8: {
        const LEVELS = [
          { value: "grundkenntnisse", label: "Grundkenntnisse" },
          { value: "fliessend", label: "Fließend" },
          { value: "muttersprache", label: "Muttersprache" },
        ];
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">Sprache & Standort</h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Wo wird die Pflegekraft benötigt, und welche Sprache soll sie sprechen?
            </p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-[#2D2D2D] mb-2.5 block">
                  Sprache der Pflegekraft
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["Deutsch", "Kroatisch", "Slowakisch", "Ungarisch", "Rumänisch", "Englisch"].map(
                    (lang) => (
                      <Chip
                        key={lang}
                        label={lang}
                        selected={!!data.sprachen.find((s) => s.lang === lang)}
                        onClick={() => toggleSprache(lang)}
                      />
                    )
                  )}
                </div>

                {/* Level selector for each selected language */}
                <AnimatePresence>
                  {data.sprachen.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        {data.sprachen.map(({ lang, level }) => (
                          <div
                            key={lang}
                            className="flex items-center gap-3 bg-[#FAF6F1] rounded-xl px-3 py-2"
                          >
                            <span className="text-sm font-semibold text-[#2D2D2D] w-24 shrink-0">
                              {lang}
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                              {LEVELS.map((l) => (
                                <button
                                  key={l.value}
                                  onClick={() => setSpracheLevel(lang, l.value)}
                                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                    level === l.value
                                      ? "bg-[#C06B4A] border-[#C06B4A] text-white"
                                      : "border-[#EAD9C8] text-[#2D2D2D]/60 hover:border-[#C06B4A]/50"
                                  }`}
                                >
                                  {l.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="text-sm font-bold text-[#2D2D2D] mb-2.5 block">
                  Ort oder Postleitzahl
                </label>
                <InputField
                  value={data.ort}
                  onChange={(v) => set("ort", v)}
                  placeholder="z.B. Wien oder 1010"
                />
              </div>
            </div>
          </div>
        );
      }

      // ── 9: Kontakt ────────────────────────────────────────────────────────────
      case 9:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mb-1">Fast geschafft!</h2>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Hinterlassen Sie Ihre Kontaktdaten. Wir melden uns innerhalb von 24 Stunden — kostenlos und unverbindlich.
            </p>
            <div className="space-y-3">
              <InputField
                value={data.name}
                onChange={(v) => set("name", v)}
                placeholder="Ihr Name"
                required
              />
              <div>
                <InputField
                  type="email"
                  value={data.email}
                  onChange={(v) => { set("email", v); setFieldErrors((e) => ({ ...e, email: undefined })); }}
                  placeholder="E-Mail-Adresse"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <InputField
                  type="tel"
                  value={data.telefon}
                  onChange={(v) => { set("telefon", v); setFieldErrors((e) => ({ ...e, telefon: undefined })); }}
                  placeholder="Telefonnummer (optional)"
                />
                {fieldErrors.telefon && (
                  <p className="text-xs text-red-500 mt-1 ml-1">{fieldErrors.telefon}</p>
                )}
              </div>
              <textarea
                value={data.prioritaeten}
                onChange={(e) => set("prioritaeten", e.target.value)}
                placeholder="Was ist Ihnen besonders wichtig? (optional)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/15 transition-colors placeholder:text-[#2D2D2D]/35 resize-none"
              />
            </div>
          </div>
        );

      // ── 10: Wunschtermine ─────────────────────────────────────────────────────
      case 10: {
        if (status === "success") {
          return (
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <CheckCircle className="w-16 h-16 text-[#7B9E7B]" />
              </motion.div>
              <div>
                <p className="font-bold text-xl text-[#2D2D2D]">
                  Vielen Dank, {data.name.split(" ")[0]}!
                </p>
                <p className="text-[#2D2D2D]/55 mt-2 text-sm leading-relaxed">
                  Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden bei Ihnen — kostenlos und unverbindlich.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 bg-[#7B9E7B] hover:bg-[#5A7A5A] text-white px-8 py-3 rounded-full font-semibold transition-colors cursor-pointer"
              >
                Fenster schließen
              </button>
            </div>
          );
        }

        const todayPlus1 = new Date();
        todayPlus1.setDate(todayPlus1.getDate() + 1);
        const minDate = todayPlus1.toISOString().split("T")[0];

        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-[#C06B4A]" />
              <h2 className="text-2xl font-bold text-[#2D2D2D]">Wunschtermine Kennenlernen</h2>
            </div>
            <p className="text-[#2D2D2D]/55 text-sm mb-6">
              Wann hätten Sie Zeit für ein kurzes Kennenlerngespräch? Geben Sie bis zu 3 Wunschtermine an — dieser Schritt ist optional.
            </p>

            <div className="space-y-4">
              {slotInputs.map((slot, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#2D2D2D]/55 uppercase tracking-wide">
                    {i + 1}. Wunschtermin (optional)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={slot.date}
                      min={minDate}
                      onChange={(e) => updateSlot(i, "date", e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border-2 border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/15 transition-colors"
                    />
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateSlot(i, "time", e.target.value)}
                      disabled={!slot.date}
                      className="w-28 px-3 py-2.5 rounded-xl border-2 border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/15 transition-colors disabled:opacity-40"
                    />
                    <select
                      value={slot.durationMin}
                      onChange={(e) => updateSlot(i, "durationMin", Number(e.target.value) as 30 | 60)}
                      disabled={!slot.date}
                      className="w-24 px-3 py-2.5 rounded-xl border-2 border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <option value={30}>30 Min.</option>
                      <option value={60}>60 Min.</option>
                    </select>
                  </div>
                </div>
              ))}

              {slotError && (
                <p className="text-xs text-red-500">{slotError}</p>
              )}

              {status === "error" && (
                <p className="text-xs text-red-500 text-center">
                  Fehler beim Senden. Bitte versuchen Sie es erneut.
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="w-full bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 text-white py-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Wird gesendet…
                  </>
                ) : (
                  <>
                    Kostenlos anfragen <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#2D2D2D]/35 text-center">
                100% kostenlos & unverbindlich · Datenschutz wird beachtet
              </p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ── Footer logic ──────────────────────────────────────────────────────────────
  // Steps 1–6: auto-advance on click → only show "Zurück"
  // Steps 7–9: show "Zurück" + "Weiter"
  // Step 10: show "Zurück" (submit is inside form)
  const showBack = step > 1 && status !== "success";
  const showWeiter = step === 8 || step === 9;
  const showFooter = showBack || showWeiter;

  function handleWeiterClick() {
    if (step === 9) {
      handleContactWeiter();
    } else {
      goNext();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal wrapper */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl shadow-black/20 overflow-hidden max-h-[92vh] flex flex-col pointer-events-auto"
            >
              {/* Progress bar */}
              <div className="h-1 bg-[#EAD9C8] shrink-0">
                <motion.div
                  className="h-full bg-[#C06B4A] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
                <span className="text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-widest">
                  Schritt {step} / {TOTAL_STEPS}
                </span>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-[#FAF6F1] hover:bg-[#EAD9C8] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#2D2D2D]/60" />
                </button>
              </div>

              {/* Step content */}
              <div className="flex-1 overflow-y-auto px-6 pb-2">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              {showFooter && (
                <div className="px-6 py-4 border-t border-[#EAD9C8] flex items-center justify-between shrink-0">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#2D2D2D]/45 hover:text-[#2D2D2D] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück
                  </button>
                  {showWeiter && (
                    <button
                      onClick={handleWeiterClick}
                      disabled={step === 9 && (!data.name.trim() || !data.email.trim())}
                      className="flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Weiter <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
