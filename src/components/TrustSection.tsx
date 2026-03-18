"use client";

import { motion } from "framer-motion";

const mediaLogos = [
  { name: "Der Standard", abbr: "DS" },
  { name: "Kleine Zeitung", abbr: "KZ" },
  { name: "ORF", abbr: "ORF" },
  { name: "APA", abbr: "APA" },
  { name: "WKO", abbr: "WKO" },
];

const trustPoints = [
  {
    icon: "🔍",
    title: "Verifizierte Profile",
    desc: "Alle Pflegekräfte durchlaufen einen mehrstufigen Prüfprozess inkl. Strafregisterauszug.",
  },
  {
    icon: "🏥",
    title: "Pflegegeld-kompatibel",
    desc: "Unsere Tarife sind auf das österreichische Pflegegeld (Stufe 1–7) abgestimmt.",
  },
  {
    icon: "🤝",
    title: "Faire Bezahlung",
    desc: "Pflegekräfte werden nach KV-konformen Sätzen entlohnt — transparent und sozial.",
  },
];

export default function TrustSection() {
  return (
    <section className="bg-white py-16 lg:py-20 border-y border-[#EAD9C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Media bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-[#2D2D2D]/40 uppercase tracking-widest mb-6">
            Bekannt aus österreichischen Medien
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {mediaLogos.map((logo) => (
              <div
                key={logo.name}
                className="flex items-center justify-center h-8 px-4 opacity-35 hover:opacity-60 transition-opacity"
              >
                <span className="text-[#2D2D2D] font-black text-lg tracking-tight">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-[#EAD9C8] mb-12" />

        {/* Trust points */}
        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
          {trustPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-4 p-5 rounded-2xl bg-[#FAF6F1] border border-[#EAD9C8] hover:border-[#C06B4A]/30 transition-colors"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{point.icon}</span>
              <div>
                <p className="font-bold text-[#2D2D2D] mb-1">{point.title}</p>
                <p className="text-sm text-[#2D2D2D]/60 leading-relaxed">{point.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
