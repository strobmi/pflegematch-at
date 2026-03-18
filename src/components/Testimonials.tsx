"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Elisabeth Mayr",
    location: "Salzburg",
    role: "Tochter, 52",
    text: "Nach dem Schlaganfall meines Vaters wussten wir nicht mehr weiter. pflegematch hat uns in weniger als einer Woche eine warmherzige Pflegekraft gefunden, die wirklich zu ihm passt. Das Videogespräch vorher hat uns so viel Sicherheit gegeben.",
    rating: 5,
    gradient: "from-[#C06B4A] to-[#A05438]",
    initial: "EM",
  },
  {
    name: "Franz & Renate Huber",
    location: "Innsbruck",
    role: "Ehepaar, 78 & 75",
    text: "Wir haben Szenia über pflegematch gefunden. Sie spricht perfekt Deutsch, kennt sich mit Pflegegeld Stufe 3 aus und ist inzwischen fast wie Familienmitglied. Der Matching-Algorithmus hat wirklich gut funktioniert.",
    rating: 5,
    gradient: "from-[#7B9E7B] to-[#5A7A5A]",
    initial: "FH",
  },
  {
    name: "Mag. Thomas Berger",
    location: "Wien",
    role: "Sohn, 48",
    text: "Transparent, einfühlsam und professionell. Die Plattform hat genau das geliefert, was versprochen wurde. Besonders das digitale Kennenlernen per Video war für meine Mutter wichtig — sie war anfangs skeptisch, aber nach dem Call sofort überzeugt.",
    rating: 5,
    gradient: "from-[#D4B896] to-[#B89060]",
    initial: "TB",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-[#C06B4A]/10 text-[#C06B4A] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Stimmen aus Österreich
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
            Familien,{" "}
            <span className="gradient-text">die uns vertrauen</span>
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#C06B4A] text-[#C06B4A]" />
              ))}
            </div>
            <span className="font-bold text-[#2D2D2D]">4.8 / 5</span>
            <span className="text-[#2D2D2D]/50">· Über 800 Bewertungen</span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[#FAF6F1] rounded-3xl p-6 border border-[#EAD9C8] hover:shadow-lg transition-shadow"
            >
              <Quote className="w-8 h-8 text-[#C06B4A]/20 mb-4" />
              <p className="text-[#2D2D2D]/75 leading-relaxed mb-6 text-sm">
                &quot;{t.text}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="font-bold text-[#2D2D2D] text-sm">{t.name}</p>
                  <p className="text-xs text-[#2D2D2D]/45">
                    {t.role} · {t.location}
                  </p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-[#C06B4A] text-[#C06B4A]" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
