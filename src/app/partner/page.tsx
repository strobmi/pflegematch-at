"use client";

import Link from "next/link";
import { ArrowLeft, Heart, Cpu, Users, HeadphonesIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const benefits = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Technologie-Infrastruktur",
    desc: "Nutzen Sie unseren bewährten Matching-Algorithmus, der über 40 Kriterien berücksichtigt — ohne eigene Entwicklungskosten.",
    color: "#C06B4A",
    bg: "#F5EDE3",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Zugang zu Pflegekräften",
    desc: "Profitieren Sie von unserem wachsenden Pool an verifizierten Pflegekräften österreichweit — sofort einsatzbereit.",
    color: "#7B9E7B",
    bg: "#F0F7F0",
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6" />,
    title: "Persönlicher Support",
    desc: "Unser Wiener Team begleitet Sie bei der Einführung und steht Ihnen laufend zur Seite — partnerschaftlich und verlässlich.",
    color: "#A05438",
    bg: "#F5EDE3",
  },
];

export default function PartnerPage() {
  const [form, setForm] = useState({ name: "", firma: "", email: "", telefon: "", nachricht: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/anfrage/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Ein Fehler ist aufgetreten.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Netzwerkfehler. Bitte versuchen Sie es erneut.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <header className="border-b border-[#EAD9C8] bg-white px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#C06B4A] flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-base font-bold text-[#2D2D2D]">
            pflege<span className="text-[#C06B4A]">match</span>
            <span className="text-[10px] align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
          </span>
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-14 lg:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#2D2D2D]/50 hover:text-[#C06B4A] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="inline-block bg-[#C06B4A]/10 text-[#C06B4A] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            Für Pflegedienste & Vermittler
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
            Werden Sie Plattform-Partner
          </h1>
          <p className="text-lg text-[#2D2D2D]/60 max-w-2xl leading-relaxed">
            Wir freuen uns, Sie als Partner begrüßen zu dürfen. pflegematch bietet Pflegediensten und
            Vermittlern eine bewährte digitale Infrastruktur — damit Sie sich auf das Wesentliche
            konzentrieren können: die Betreuung von Menschen.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-5 mb-16"
        >
          {benefits.map((b, i) => (
            <div
              key={i}
              className="flex gap-4 p-5 rounded-2xl bg-white border border-[#EAD9C8]"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: b.bg, color: b.color }}
              >
                {b.icon}
              </div>
              <div>
                <p className="font-bold text-[#2D2D2D] mb-1 text-sm">{b.title}</p>
                <p className="text-xs text-[#2D2D2D]/55 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white border border-[#EAD9C8] rounded-3xl p-8 lg:p-10"
        >
          <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">Individuelles Angebot anfragen</h2>
          <p className="text-sm text-[#2D2D2D]/50 mb-8">
            Wir melden uns innerhalb von 1–2 Werktagen bei Ihnen und unterbreiten Ihnen ein
            maßgeschneidertes Angebot.
          </p>

          {status === "success" ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-[#7B9E7B]/15 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-[#7B9E7B] fill-[#7B9E7B]" />
              </div>
              <p className="text-lg font-bold text-[#2D2D2D] mb-2">Anfrage eingegangen!</p>
              <p className="text-sm text-[#2D2D2D]/55">
                Vielen Dank. Wir melden uns in Kürze bei Ihnen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-[#2D2D2D] text-sm placeholder:text-[#2D2D2D]/30 focus:outline-none focus:border-[#C06B4A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide mb-1.5">
                    Firma
                  </label>
                  <input
                    type="text"
                    value={form.firma}
                    onChange={e => setForm(f => ({ ...f, firma: e.target.value }))}
                    placeholder="Pflegedienst GmbH"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-[#2D2D2D] text-sm placeholder:text-[#2D2D2D]/30 focus:outline-none focus:border-[#C06B4A] transition-colors"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide mb-1.5">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="office@beispiel.at"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-[#2D2D2D] text-sm placeholder:text-[#2D2D2D]/30 focus:outline-none focus:border-[#C06B4A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide mb-1.5">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={form.telefon}
                    onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))}
                    placeholder="+43 1 234 5678"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-[#2D2D2D] text-sm placeholder:text-[#2D2D2D]/30 focus:outline-none focus:border-[#C06B4A] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide mb-1.5">
                  Nachricht
                </label>
                <textarea
                  rows={4}
                  value={form.nachricht}
                  onChange={e => setForm(f => ({ ...f, nachricht: e.target.value }))}
                  placeholder="Beschreiben Sie kurz Ihr Unternehmen und was Sie sich von einer Partnerschaft erhoffen..."
                  className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-[#2D2D2D] text-sm placeholder:text-[#2D2D2D]/30 focus:outline-none focus:border-[#C06B4A] transition-colors resize-none"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-500">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#C06B4A]/30 cursor-pointer"
              >
                {status === "loading" ? "Wird gesendet…" : "Anfrage absenden"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
