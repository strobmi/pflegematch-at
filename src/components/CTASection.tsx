"use client";

import { motion } from "framer-motion";
import { Phone, Mail, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section id="get-started" className="py-20 lg:py-28 bg-[#FAF6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-br from-[#C06B4A] to-[#A05438] rounded-[2.5rem] p-10 lg:p-16 overflow-hidden text-white"
        >
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
                🇦🇹 Kostenloser Erstberatung
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Finden Sie jetzt die passende Pflegekraft für Ihre Familie
              </h2>
              <p className="text-white/75 text-lg leading-relaxed">
                Unser österreichisches Beratungsteam meldet sich innerhalb von 24 Stunden bei Ihnen — kostenlos und unverbindlich.
              </p>
            </div>

            {/* Right: Form / Contact */}
            <div className="bg-white rounded-3xl p-6 text-[#2D2D2D]">
              <h3 className="font-bold text-xl mb-5">Jetzt unverbindlich anfragen</h3>

              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Ihr Name"
                  className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35"
                />
                <input
                  type="tel"
                  placeholder="Telefonnummer"
                  className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35"
                />
                <select
                  className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] text-[#2D2D2D]/70"
                >
                  <option value="">Pflegebedarf auswählen...</option>
                  <option>Stundenweise Betreuung</option>
                  <option>Tagesbetreuung</option>
                  <option>24-Stunden-Pflege</option>
                  <option>Nachtsitzung</option>
                </select>
              </div>

              <button className="w-full bg-[#C06B4A] hover:bg-[#A05438] text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                Kostenlos anfragen
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-[#2D2D2D]/40 text-center mt-3">
                Mit der Anfrage stimmen Sie unserer Datenschutzerklärung zu.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact alternatives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
        >
          <a
            href="tel:+43800123456"
            className="flex items-center justify-center gap-3 bg-white border border-[#EAD9C8] px-6 py-4 rounded-2xl hover:border-[#C06B4A]/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5EDE3] flex items-center justify-center group-hover:bg-[#C06B4A]/10 transition-colors">
              <Phone className="w-5 h-5 text-[#C06B4A]" />
            </div>
            <div>
              <p className="text-xs text-[#2D2D2D]/50">Kostenlose Hotline</p>
              <p className="font-bold text-[#2D2D2D]">0800 123 456</p>
            </div>
          </a>
          <a
            href="mailto:hallo@pflegematch.at"
            className="flex items-center justify-center gap-3 bg-white border border-[#EAD9C8] px-6 py-4 rounded-2xl hover:border-[#C06B4A]/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5EDE3] flex items-center justify-center group-hover:bg-[#C06B4A]/10 transition-colors">
              <Mail className="w-5 h-5 text-[#C06B4A]" />
            </div>
            <div>
              <p className="text-xs text-[#2D2D2D]/50">E-Mail</p>
              <p className="font-bold text-[#2D2D2D]">hallo@pflegematch.at</p>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
