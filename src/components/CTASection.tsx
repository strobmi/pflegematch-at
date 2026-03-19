"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Star } from "lucide-react";
import { useFragebogen } from "@/components/FragebogenContext";

export default function CTASection() {
  const { openModal } = useFragebogen();

  return (
    <section id="get-started" className="py-20 lg:py-28 bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-br from-[#C06B4A] to-[#A05438] rounded-[2.5rem] p-10 lg:p-16 overflow-hidden text-white"
        >
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row gap-10 items-center justify-between">
            {/* Left */}
            <div className="max-w-xl">
              <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
                🇦🇹 Kostenlose Erstberatung
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Finden Sie jetzt die passende Pflegekraft für Ihre Familie
              </h2>
              <p className="text-white/75 text-lg leading-relaxed mb-8">
                Unser österreichisches Beratungsteam meldet sich innerhalb von 24 Stunden bei Ihnen — kostenlos und unverbindlich.
              </p>

              {/* Trust chips */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <Shield className="w-3.5 h-3.5" />, text: "Geprüfte Pflegekräfte" },
                  { icon: <Star className="w-3.5 h-3.5 fill-current" />, text: "100% kostenlos" },
                  { icon: <Clock className="w-3.5 h-3.5" />, text: "Antwort in 24 Stunden" },
                ].map((chip) => (
                  <div
                    key={chip.text}
                    className="flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {chip.icon}
                    {chip.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: CTA */}
            <div className="shrink-0">
              <button
                onClick={openModal}
                className="group inline-flex items-center gap-3 bg-white text-[#C06B4A] hover:bg-[#FAF6F1] px-10 py-5 rounded-2xl text-lg font-bold transition-all duration-200 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 cursor-pointer"
              >
                Jetzt starten
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <p className="text-white/50 text-xs text-center mt-3">
                In 3 Minuten ausgefüllt
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
