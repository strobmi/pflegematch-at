"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CTASection() {
  const [name, setName] = useState("");
  const [pflegebedarf, setPflegebedarf] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit() {
    if (!name.trim()) return;
    setStatus("loading");

    const res = await fetch("/api/anfrage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pflegebedarf, nachricht }),
    });

    setStatus(res.ok ? "success" : "error");
  }

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

            {/* Right: Form */}
            <div className="bg-white rounded-3xl p-6 text-[#2D2D2D]">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <CheckCircle className="w-10 h-10 text-[#7B9E7B]" />
                  <p className="font-bold text-lg">Anfrage gesendet!</p>
                  <p className="text-sm text-[#2D2D2D]/60">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-xl mb-5">Jetzt unverbindlich anfragen</h3>

                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      placeholder="Ihr Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35"
                    />
                    <select
                      value={pflegebedarf}
                      onChange={(e) => setPflegebedarf(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] text-[#2D2D2D]/70"
                    >
                      <option value="">Pflegebedarf auswählen...</option>
                      <option>Stundenweise Betreuung</option>
                      <option>Tagesbetreuung</option>
                      <option>24-Stunden-Pflege</option>
                      <option>Nachtsitzung</option>
                    </select>
                    <textarea
                      placeholder="Ihre Nachricht (optional)"
                      value={nachricht}
                      onChange={(e) => setNachricht(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35 resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-500 mb-3 text-center">
                      Fehler beim Senden. Bitte versuchen Sie es erneut.
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={status === "loading" || !name.trim()}
                    className="w-full bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {status === "loading"
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gesendet…</>
                      : <><span>Kostenlos anfragen</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>

                  <p className="text-xs text-[#2D2D2D]/40 text-center mt-3">
                    Mit der Anfrage stimmen Sie unserer Datenschutzerklärung zu.
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
