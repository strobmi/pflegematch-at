"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

const kostenPosten = [
  {
    kategorie: "Tägliche Betreuung",
    label: "Tagessatz Pflegekraft",
    betrag: "€ 100 – 150",
    einheit: "pro Tag",
    hinweis: "Je nach Pflegebedarf und Qualifikation",
  },
  {
    kategorie: "Tägliche Betreuung",
    label: "Reisekosten (Hin- & Rückreise)",
    betrag: "ab € 150",
    einheit: "pro Turnus",
    hinweis: "Einmalig je Betreuungswechsel",
  },
  {
    kategorie: "Laufende Kosten",
    label: "Sozialversicherung",
    betrag: "ab € 240",
    einheit: "pro 14-Tage-Zyklus",
    hinweis: "Gesetzlich vorgeschrieben bei selbstständigen Betreuer:innen",
  },
  {
    kategorie: "Laufende Kosten",
    label: "Monatliche Fachaufsicht",
    betrag: "€ 300",
    einheit: "pro Monat",
    hinweis: "Professionelle Begleitung & Qualitätssicherung (inkl. MwSt.)",
  },
];

const vermittlungsGebuehren = [
  {
    label: "Erstzuteilung (2 Pflegekräfte)",
    betrag: "€ 720",
    detail: "inkl. 20 % MwSt.",
  },
  {
    label: "Jede weitere Zuteilung",
    betrag: "€ 384",
    detail: "inkl. MwSt.",
  },
];

const foerderungen = [
  {
    icon: "🏛️",
    title: "Staatliche Förderung",
    betrag: "bis zu € 800 / Monat",
    bedingungen: [
      "Pflegestufe 3 oder höher",
      "Zwei gemeldete Betreuer:innen",
      "Einkommen unter € 2.500 / Monat",
    ],
  },
  {
    icon: "📋",
    title: "Pflegegeld 2026",
    betrag: "€ 206,20 – € 2.214,80",
    bedingungen: [
      "Stufe 1: € 206,20",
      "Stufe 4: € 776,40",
      "Stufe 7: € 2.214,80",
    ],
  },
  {
    icon: "💼",
    title: "Steuerliche Absetzbarkeit",
    betrag: "30 – 40 % Rückerstattung",
    bedingungen: [
      "Außergewöhnliche Belastung",
      "Je nach Pensionseinkommen",
      "Jährliche Steuererklärung",
    ],
  },
];

export default function KostenSection() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-[#C06B4A]/10 text-[#C06B4A] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
            Transparente Kosten
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2D2D] leading-tight mb-4">
            Was kostet 24-Stunden-Pflege?
          </h2>
          <p className="text-[#2D2D2D]/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Alle Kosten auf einen Blick — inklusive staatlicher Förderungen, Pflegegeld und steuerlicher Vorteile.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Kostenübersicht */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl border border-[#EAD9C8] overflow-hidden"
          >
            <div className="px-6 pt-6 pb-4 border-b border-[#EAD9C8]">
              <h3 className="text-lg font-bold text-[#2D2D2D]">Laufende Kosten</h3>
              <p className="text-sm text-[#2D2D2D]/50 mt-0.5">Monatliche Gesamtkosten im Überblick</p>
            </div>

            <div className="divide-y divide-[#EAD9C8]">
              {kostenPosten.map((posten, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#FAF6F1] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2D2D2D] text-sm leading-snug">{posten.label}</p>
                    <p className="text-xs text-[#2D2D2D]/45 mt-0.5 leading-snug">{posten.hinweis}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#C06B4A] text-base">{posten.betrag}</p>
                    <p className="text-xs text-[#2D2D2D]/40">{posten.einheit}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Vermittlungsgebühren */}
            <div className="px-6 pt-5 pb-4 border-t border-[#EAD9C8] bg-[#FAF6F1]">
              <p className="text-xs font-bold text-[#2D2D2D]/50 uppercase tracking-widest mb-3">
                Einmalige Vermittlungsgebühr
              </p>
              <div className="space-y-2">
                {vermittlungsGebuehren.map((g, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#2D2D2D]/70">{g.label}</span>
                    <div className="text-right">
                      <span className="font-bold text-[#2D2D2D] text-sm">{g.betrag}</span>
                      <span className="text-xs text-[#2D2D2D]/40 ml-1">{g.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Förderungen */}
          <div className="space-y-4">
            {foerderungen.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-[#EAD9C8] p-5 hover:border-[#C06B4A]/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-bold text-[#2D2D2D]">{f.title}</p>
                      <span className="text-sm font-bold text-[#7B9E7B] bg-[#7B9E7B]/10 px-3 py-0.5 rounded-full whitespace-nowrap">
                        {f.betrag}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {f.bedingungen.map((b, j) => (
                        <li key={j} className="text-sm text-[#2D2D2D]/60 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#C06B4A]/40 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hinweis-Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex gap-3 items-start bg-[#C06B4A]/8 border border-[#C06B4A]/20 rounded-2xl px-5 py-4"
        >
          <Info className="w-5 h-5 text-[#C06B4A] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#2D2D2D]/70 leading-relaxed">
            <span className="font-semibold text-[#2D2D2D]">Individuelle Kostenberechnung: </span>
            Die tatsächlichen Kosten hängen von Pflegestufe, Betreuungsaufwand und Region ab.
            Unser Beratungsteam erstellt Ihnen kostenlos und unverbindlich eine persönliche Kostenübersicht.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
