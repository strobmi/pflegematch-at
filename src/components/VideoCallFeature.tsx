"use client";

import { motion } from "framer-motion";
import { Video, Mic, PhoneOff, MessageSquare, Shield, Smile } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Ende-zu-Ende verschlüsselt",
    desc: "Alle Gespräche sind vollständig verschlüsselt und DSGVO-konform gespeichert.",
  },
  {
    icon: <Smile className="w-5 h-5" />,
    title: "Keine App nötig",
    desc: "Videocalls direkt im Browser — ohne Installation, ohne Aufwand.",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Gesprächsleitfaden inklusive",
    desc: "Wir helfen Ihnen mit vorbereiteten Fragen für das erste Kennenlerngespräch.",
  },
];

export default function VideoCallFeature() {
  return (
    <section className="py-20 lg:py-28 bg-[#FAF6F1] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Video UI mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            {/* Main video window */}
            <div className="bg-[#2D2D2D] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border border-[#444] aspect-video relative">
              {/* Video background simulation */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a]" />

              {/* Room decoration lines */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#2a2a2a] to-transparent" />

              {/* Main participant (Caregiver) */}
              <div className="absolute inset-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C06B4A] to-[#A05438] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 ring-4 ring-[#C06B4A]/30">
                    M
                  </div>
                  <p className="text-white font-semibold text-sm">Maria Gruber</p>
                  <p className="text-white/50 text-xs">Pflegefachkraft · Wien</p>
                </div>
              </div>

              {/* Self-view (PiP) */}
              <div className="absolute bottom-4 right-4 w-24 h-16 bg-[#3a3a3a] rounded-xl border-2 border-[#555] overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B9E7B] to-[#5A7A5A] flex items-center justify-center text-white text-xs font-bold mx-auto">
                    Sie
                  </div>
                </div>
              </div>

              {/* Recording indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#C06B4A] animate-pulse-soft" />
                <span className="text-white text-xs font-medium">Live</span>
              </div>

              {/* Duration */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span className="text-white text-xs font-mono">04:32</span>
              </div>

              {/* Controls bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Mic className="w-4 h-4 text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Video className="w-4 h-4 text-white" />
                </button>
                <button className="w-12 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                  <PhoneOff className="w-4 h-4 text-white" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <MessageSquare className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Floating chat bubble */}
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -right-6 top-1/4 bg-white rounded-2xl rounded-tr-sm p-3 shadow-xl border border-[#EAD9C8] max-w-[180px] hidden lg:block"
            >
              <p className="text-xs text-[#2D2D2D] font-medium">"Ich habe viel Erfahrung mit Parkinson-Erkrankungen."</p>
              <p className="text-[10px] text-[#2D2D2D]/40 mt-1">Maria · gerade eben</p>
            </motion.div>

            {/* Floating leitfaden card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute -left-4 bottom-8 bg-white rounded-2xl p-3 shadow-xl border border-[#EAD9C8] hidden lg:block"
            >
              <p className="text-[10px] text-[#2D2D2D]/50 mb-1.5 font-semibold uppercase tracking-wide">Nächste Frage</p>
              <p className="text-xs text-[#2D2D2D] font-medium max-w-[160px]">"Wie gehen Sie mit herausforderndem Verhalten um?"</p>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <span className="inline-block bg-[#C06B4A]/10 text-[#C06B4A] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Digitales Kennenlernen
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-5 leading-tight">
              Vertrauen entsteht{" "}
              <span className="gradient-text">von Angesicht zu Angesicht</span>
            </h2>
            <p className="text-lg text-[#2D2D2D]/60 leading-relaxed mb-8">
              Bevor eine Pflegekraft das erste Mal in Ihre Wohnung kommt, lernen Sie sich in einem entspannten Videogespräch kennen. Stellen Sie Ihre Fragen, testen Sie die Chemie — und entscheiden Sie erst dann.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-[#EAD9C8]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5EDE3] text-[#C06B4A] flex items-center justify-center flex-shrink-0">
                    {feat.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D2D2D] text-sm mb-0.5">{feat.title}</p>
                    <p className="text-sm text-[#2D2D2D]/55">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <a
              href="#get-started"
              className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-7 py-4 rounded-full font-bold transition-all duration-200 hover:shadow-xl hover:shadow-[#C06B4A]/30"
            >
              <Video className="w-5 h-5" />
              Erstes Kennenlernen planen
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
