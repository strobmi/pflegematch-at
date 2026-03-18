"use client";

import { motion } from "framer-motion";
import { ClipboardList, Cpu, Video, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <ClipboardList className="w-6 h-6" />,
    title: "Bedarf erfassen",
    desc: "Erzählen Sie uns von Ihrer Pflegesituation: Pflegestufe, gewünschte Einsatzzeiten, Sprachen und besondere Anforderungen. In nur 5 Minuten.",
    detail: "Unser Fragebogen ist auf österreichisches Pflegegeld und KV-Einstufungen abgestimmt.",
    color: "#C06B4A",
    bg: "#F5EDE3",
  },
  {
    number: "02",
    icon: <Cpu className="w-6 h-6" />,
    title: "Intelligentes Matching",
    desc: "Unser Algorithmus analysiert über 40 Kriterien: Qualifikation, Erfahrung, Persönlichkeit, Standort und Verfügbarkeit — für wirklich passende Vorschläge.",
    detail: "Durchschnittlich 3 Top-Matches innerhalb von 24 Stunden.",
    color: "#7B9E7B",
    bg: "#F0F7F0",
  },
  {
    number: "03",
    icon: <Video className="w-6 h-6" />,
    title: "Digitales Kennenlernen",
    desc: "Lernen Sie Ihre Kandidatinnen per Videogespräch kennen, bevor irgendeine Verpflichtung entsteht. Authentisch, persönlich und sicher.",
    detail: "Videocalls direkt in der Plattform — kein Zoom oder externe Tools nötig.",
    color: "#A05438",
    bg: "#F5EDE3",
  },
  {
    number: "04",
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Einsatz beginnt",
    desc: "Nach der gegenseitigen Zusage kümmern wir uns um alle administrativen Schritte: Vertrag, Anmeldung, Einarbeitung. Sie können sich entspannen.",
    detail: "Laufende Begleitung durch unser Wiener Beratungsteam.",
    color: "#5A7A5A",
    bg: "#F0F7F0",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[#C06B4A]/10 text-[#C06B4A] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Der Prozess
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
            Ihre digitale{" "}
            <span className="gradient-text">Kennenlernjournney</span>
          </h2>
          <p className="text-lg text-[#2D2D2D]/60 max-w-2xl mx-auto">
            Von der ersten Anfrage bis zum vertrauensvollen Einsatz — transparent, persönlich und österreichweit.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#C06B4A]/20 via-[#7B9E7B]/40 to-[#5A7A5A]/20 hidden lg:block" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative group"
              >
                {/* Step card */}
                <div className="bg-white rounded-3xl p-6 border border-[#EAD9C8] shadow-sm hover:shadow-xl hover:shadow-[#C06B4A]/8 transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Number + Icon */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: step.bg, color: step.color }}
                    >
                      {step.icon}
                    </div>
                    <span
                      className="text-3xl font-black opacity-15"
                      style={{ color: step.color }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#2D2D2D] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#2D2D2D]/60 leading-relaxed mb-4">{step.desc}</p>

                  {/* Detail hint */}
                  <div
                    className="text-xs font-medium px-3 py-2 rounded-xl"
                    style={{ backgroundColor: step.bg, color: step.color }}
                  >
                    💡 {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="#get-started"
            className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-200 hover:shadow-xl hover:shadow-[#C06B4A]/30"
          >
            Jetzt kostenlos starten
            <span>→</span>
          </a>
          <p className="text-sm text-[#2D2D2D]/40 mt-3">Keine Kreditkarte notwendig · Erstberatung kostenlos</p>
        </motion.div>
      </div>
    </section>
  );
}
