"use client";

import { motion } from "framer-motion";
import { Star, Shield, Clock, ChevronDown } from "lucide-react";
import { useFragebogen } from "@/components/FragebogenContext";

const stats = [
  { value: "2.400+", label: "Vermittlungen in AT" },
  { value: "4.8★", label: "Durchschnittsbewertung" },
  { value: "5–7 Tage", label: "bis zur passenden Kraft" },
];

export default function Hero() {
  const { openModal } = useFragebogen();

  return (
    <section className="relative flex items-center pt-20 overflow-hidden bg-[#FAF6F1]">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#C06B4A]/8 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-[#7B9E7B]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#D4B896]/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-[#7B9E7B]/15 text-[#5A7A5A] px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <span className="text-base">🇦🇹</span>
              Österreichs Pflege-Matching-Plattform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#2D2D2D] leading-tight mb-6"
            >
              Die richtige{" "}
              <span className="relative inline-block">
                <span className="gradient-text">Pflegekraft</span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-[#C06B4A]/30 rounded-full origin-left"
                />
              </span>
              {" "}für Ihre Familie
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#2D2D2D]/65 leading-relaxed mb-8 max-w-xl"
            >
              Unser intelligenter Matching-Algorithmus verbindet pflegebedürftige Menschen und ihre Familien mit verifizierten, einfühlsamen Pflegekräften in ganz Österreich — für eine persönliche Kennenlernjournney mit Videogespräch vor dem ersten Einsatz.
            </motion.p>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {[
                { icon: <Shield className="w-3.5 h-3.5" />, text: "Geprüfte Pflegekräfte" },
                { icon: <Star className="w-3.5 h-3.5 fill-current" />, text: "Pflegegeld-kompatibel" },
                { icon: <Clock className="w-3.5 h-3.5" />, text: "In 5–7 Tagen vermittelt" },
              ].map((chip) => (
                <div
                  key={chip.text}
                  className="flex items-center gap-1.5 bg-white text-[#2D2D2D]/70 text-xs font-medium px-3 py-1.5 rounded-full border border-[#EAD9C8] shadow-sm"
                >
                  <span className="text-[#C06B4A]">{chip.icon}</span>
                  {chip.text}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={openModal}
                className="inline-flex items-center justify-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-200 hover:shadow-xl hover:shadow-[#C06B4A]/30 hover:-translate-y-0.5 cursor-pointer"
              >
                Jetzt Pflegekraft finden
                <span className="text-lg">→</span>
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F5EDE3] text-[#2D2D2D] px-8 py-4 rounded-full text-base font-semibold border border-[#EAD9C8] transition-all duration-200 hover:shadow-md"
              >
                Wie es funktioniert
              </a>
            </motion.div>
          </div>

          {/* Right: Visual Card Stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Main hero card */}
            <div className="relative bg-white rounded-3xl p-6 shadow-2xl shadow-[#C06B4A]/10 border border-[#EAD9C8]">
              {/* Match notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute -top-4 -right-4 bg-[#7B9E7B] text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg flex items-center gap-1.5 animate-float"
              >
                <span>✓</span> Match gefunden!
              </motion.div>

              {/* Profile area */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C06B4A] to-[#A05438] flex items-center justify-center text-white text-2xl font-bold">
                    M
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#7B9E7B] rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-[8px]">✓</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[#2D2D2D] text-lg">Maria Gruber</p>
                  <p className="text-[#2D2D2D]/55 text-sm">Dipl. Pflegekraft · Wien</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#C06B4A] text-[#C06B4A]" />
                    ))}
                    <span className="text-xs text-[#2D2D2D]/50 ml-1">4.9 (127)</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["Demenzpflege", "Mobilisation", "Medikamente", "Deutsch C2"].map((skill) => (
                  <span
                    key={skill}
                    className="bg-[#F5EDE3] text-[#C06B4A] text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Match score */}
              <div className="bg-[#FAF6F1] rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#2D2D2D]">Matching-Score</span>
                  <span className="text-lg font-bold text-[#7B9E7B]">97%</span>
                </div>
                <div className="h-2 bg-[#EAD9C8] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "97%" }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#7B9E7B] to-[#5A7A5A] rounded-full"
                  />
                </div>
              </div>

              {/* Kennenlernen — dekorativ, nicht klickbar */}
              <div className="w-full bg-[#C06B4A]/90 text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 cursor-default select-none opacity-90">
                <span className="text-base">🎥</span>
                Kennenlerngespräch starten
              </div>
            </div>

            {/* Background card decoration */}
            <div className="absolute -z-10 top-4 left-4 right-4 bottom-4 bg-[#EAD9C8] rounded-3xl" />
            <div className="absolute -z-20 top-8 left-8 right-8 bottom-8 bg-[#D4B896]/50 rounded-3xl" />

            {/* Floating stat */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute -left-8 top-1/3 bg-white rounded-2xl px-4 py-3 shadow-xl border border-[#EAD9C8] hidden lg:block"
            >
              <p className="text-xs text-[#2D2D2D]/50 mb-0.5">Neue Anfragen heute</p>
              <p className="text-2xl font-bold text-[#C06B4A]">+24</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-3 gap-4 mt-16 pt-12 border-t border-[#EAD9C8]"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#C06B4A] mb-1">{stat.value}</p>
              <p className="text-sm text-[#2D2D2D]/55">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#2D2D2D]/30"
        >
          <span className="text-xs font-medium">Mehr entdecken</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
