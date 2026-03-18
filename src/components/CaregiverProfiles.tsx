"use client";

import { motion } from "framer-motion";
import { Star, MapPin, Languages, Heart, Video } from "lucide-react";

const caregivers = [
  {
    name: "Maria Gruber",
    initial: "MG",
    role: "Diplomierte Pflegefachkraft",
    location: "Wien, 1190",
    rating: 4.9,
    reviews: 127,
    experience: "12 Jahre",
    languages: ["Deutsch", "Englisch"],
    skills: ["Demenzpflege", "Mobilisation", "Wundversorgung"],
    matchScore: 97,
    available: true,
    gradient: "from-[#C06B4A] to-[#A05438]",
    accentColor: "#C06B4A",
  },
  {
    name: "Emőke Varga",
    initial: "EV",
    role: "Pflegeassistentin",
    location: "Graz, 8020",
    rating: 4.8,
    reviews: 89,
    experience: "7 Jahre",
    languages: ["Deutsch", "Ungarisch", "Englisch"],
    skills: ["Grundpflege", "Aktivierung", "Begleitung"],
    matchScore: 91,
    available: true,
    gradient: "from-[#7B9E7B] to-[#5A7A5A]",
    accentColor: "#7B9E7B",
  },
  {
    name: "Ana Kovačević",
    initial: "AK",
    role: "Heimhilferin + 24h-Betreuung",
    location: "Linz, 4020",
    rating: 4.7,
    reviews: 54,
    experience: "5 Jahre",
    languages: ["Deutsch", "Kroatisch"],
    skills: ["24h Betreuung", "Haushalt", "Spazierbegleitung"],
    matchScore: 85,
    available: false,
    gradient: "from-[#D4B896] to-[#B89060]",
    accentColor: "#B89060",
  },
];

export default function CaregiverProfiles() {
  return (
    <section id="caregivers" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block bg-[#7B9E7B]/15 text-[#5A7A5A] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Unsere Pflegekräfte
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2D2D]">
              Echte Menschen,{" "}
              <span className="gradient-text">echte Fürsorge</span>
            </h2>
            <p className="text-lg text-[#2D2D2D]/60 mt-3 max-w-xl">
              Lernen Sie exemplarische Profile kennen. Alle Personen sind geprüft, versichert und persönlich interviewt.
            </p>
          </div>
          <a
            href="#get-started"
            className="flex-shrink-0 bg-[#FAF6F1] hover:bg-[#F5EDE3] text-[#C06B4A] font-semibold px-6 py-3 rounded-full border border-[#EAD9C8] transition-colors text-sm"
          >
            Alle Profile ansehen →
          </a>
        </motion.div>

        {/* Profile Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {caregivers.map((cg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-[#FAF6F1] rounded-3xl p-6 border border-[#EAD9C8] hover:border-[#C06B4A]/30 hover:shadow-xl hover:shadow-[#C06B4A]/8 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cg.gradient} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}
                  >
                    {cg.initial}
                  </div>
                  <div>
                    <p className="font-bold text-[#2D2D2D]">{cg.name}</p>
                    <p className="text-xs text-[#2D2D2D]/55 mt-0.5">{cg.role}</p>
                  </div>
                </div>
                {/* Availability badge */}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    cg.available
                      ? "bg-[#7B9E7B]/15 text-[#5A7A5A]"
                      : "bg-[#EAD9C8] text-[#2D2D2D]/40"
                  }`}
                >
                  {cg.available ? "● Verfügbar" : "○ Belegt"}
                </span>
              </div>

              {/* Rating & Location */}
              <div className="flex items-center gap-3 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#C06B4A] text-[#C06B4A]" />
                  <span className="font-semibold text-[#2D2D2D]">{cg.rating}</span>
                  <span className="text-[#2D2D2D]/40">({cg.reviews})</span>
                </div>
                <span className="text-[#EAD9C8]">·</span>
                <div className="flex items-center gap-1 text-[#2D2D2D]/55">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{cg.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {cg.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-white text-[#2D2D2D]/70 text-xs px-2.5 py-1 rounded-full border border-[#EAD9C8]"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Languages */}
              <div className="flex items-center gap-1.5 mb-4 text-xs text-[#2D2D2D]/55">
                <Languages className="w-3.5 h-3.5" />
                {cg.languages.join(" · ")}
                <span className="ml-1 text-[#2D2D2D]/35">· {cg.experience} Erfahrung</span>
              </div>

              {/* Match Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#2D2D2D]/55 font-medium">Matching-Score</span>
                  <span className="font-bold" style={{ color: cg.accentColor }}>
                    {cg.matchScore}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#EAD9C8] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${cg.matchScore}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cg.accentColor }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-white hover:bg-[#FAF6F1] text-[#2D2D2D] text-xs font-semibold py-2.5 rounded-xl border border-[#EAD9C8] transition-colors flex items-center justify-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  Merken
                </button>
                <button
                  className="flex-1 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: cg.accentColor }}
                >
                  <Video className="w-3.5 h-3.5" />
                  Kennenlernen
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-[#2D2D2D]/40 mt-8"
        >
          Beispielprofile — alle Namen und Bilder sind illustrativ. Echte Profile sehen Sie nach der Registrierung.
        </motion.p>
      </div>
    </section>
  );
}
