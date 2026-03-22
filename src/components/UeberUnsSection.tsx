"use client";

import { motion } from "framer-motion";
import { Heart, Handshake, Leaf, Shield } from "lucide-react";

const values = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Menschlichkeit zuerst",
    desc: "Pflege ist Vertrauenssache. Wir vermitteln keine anonymen Profile, sondern echte Menschen — mit Geschichte, Persönlichkeit und Empathie.",
  },
  {
    icon: <Handshake className="w-5 h-5" />,
    title: "Nachhaltige Verbindungen",
    desc: "Wir suchen nicht den schnellsten Match, sondern den richtigen. Langfristige, stabile Beziehungen zwischen Familien und Pflegekräften sind unser Ziel.",
  },
  {
    icon: <Leaf className="w-5 h-5" />,
    title: "Würdevolle Pflege",
    desc: "Jeder Mensch verdient Pflege, die seiner Würde gerecht wird — daheim, in vertrauter Umgebung, begleitet von jemandem, dem man wirklich vertraut.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Faire Bedingungen",
    desc: "Transparente Kosten, geprüfte Pflegekräfte, klare Verträge. Wir stehen für Verlässlichkeit — auf beiden Seiten der Vermittlung.",
  },
];

export default function UeberUnsSection() {
  return (
    <section id="about" className="py-20 lg:py-28 bg-white border-t border-[#EAD9C8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left: Über uns */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#C06B4A] mb-4">
              Über uns
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] leading-tight mb-6">
              Wir bringen Menschen zusammen — mit Herz und Technologie
            </h2>
            <p className="text-[#2D2D2D]/65 leading-relaxed mb-4">
              pflegematch entstand aus einer einfachen Überzeugung: Gute Pflege beginnt mit dem richtigen Menschen. Nicht mit dem nächstbesten Profil, das gerade verfügbar ist — sondern mit jemandem, der wirklich passt.
            </p>
            <p className="text-[#2D2D2D]/65 leading-relaxed">
              Wir sind ein österreichisches Team, das Familien und Pflegekräfte auf Augenhöhe zusammenbringt. Mit moderner Technologie im Hintergrund, aber immer mit dem Menschen im Mittelpunkt.
            </p>
          </motion.div>

          {/* Right: Mission */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="bg-gradient-to-br from-[#FAF6F1] to-[#F5EDE3] rounded-3xl p-8 lg:p-10 border border-[#EAD9C8]"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#C06B4A] mb-4">
              Unsere Mission
            </span>
            <p className="text-xl font-semibold text-[#2D2D2D] leading-relaxed mb-6">
              „Jedem Menschen eine Pflege zu ermöglichen, die sich nach Zuhause anfühlt."
            </p>
            <p className="text-[#2D2D2D]/60 text-sm leading-relaxed">
              Pflege ist eine der persönlichsten Dienstleistungen überhaupt. Wir wollen, dass Familien nicht irgendwen finden — sondern die richtige Person. Und dass Pflegekräfte nicht irgendwo arbeiten — sondern dort, wo sie wirklich ankommen.
            </p>
            <div className="mt-6 pt-6 border-t border-[#EAD9C8] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C06B4A] flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <p className="text-xs text-[#2D2D2D]/50">
                <span className="font-semibold text-[#2D2D2D]">Made in Austria</span> — gegründet von Menschen, die selbst erlebt haben, wie wichtig die richtige Pflege ist.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-[#FAF6F1] border border-[#EAD9C8] hover:border-[#C06B4A]/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-[#C06B4A]/10 text-[#C06B4A] flex items-center justify-center mb-3">
                {v.icon}
              </div>
              <p className="font-bold text-[#2D2D2D] text-sm mb-1.5">{v.title}</p>
              <p className="text-xs text-[#2D2D2D]/55 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
