"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { notifyKeinKonto, requestPasswordReset } from "@/app/(auth)/login/actions";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Passwort vergessen
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotPending, startForgotTransition] = useTransition();

  // Kein Konto
  const [keinKontoSent, setKeinKontoSent] = useState(false);
  const [keinKontoPending, startKeinKontoTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-Mail oder Passwort ungültig.");
      setLoading(false);
      return;
    }

    // Fetch session to determine role for redirect
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    const redirectMap: Record<string, string> = {
      SUPERADMIN: "/admin",
      VERMITTLER_ADMIN: "/vermittler",
      PFLEGER: "/de/dashboard/pfleger",
      KUNDE: "/kunde",
    };

    router.push(redirectMap[role] ?? "/");
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    startForgotTransition(async () => {
      await requestPasswordReset(forgotEmail);
      setForgotSent(true);
    });
  }

  function handleKeinKonto() {
    startKeinKontoTransition(async () => {
      await notifyKeinKonto();
      setKeinKontoSent(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
          E-Mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@firma.at"
          className="w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-[#2D2D2D]">
            Passwort
          </label>
          <button
            type="button"
            onClick={() => { setShowForgot(!showForgot); setForgotSent(false); }}
            className="text-xs text-[#C06B4A] hover:underline"
          >
            Passwort vergessen?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-11 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/40 hover:text-[#2D2D2D]/70"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Passwort vergessen – inline */}
      {showForgot && (
        <div className="bg-[#FAF6F1] border border-[#EAD9C8] rounded-xl p-4 space-y-3">
          {forgotSent ? (
            <div className="flex items-center gap-2 text-sm text-[#7B9E7B]">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Falls ein Konto existiert, erhältst du eine E-Mail mit dem Reset-Link.</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#2D2D2D]/60">
                Gib deine E-Mail-Adresse ein – wir schicken dir einen Link zum Zurücksetzen.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@firma.at"
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EAD9C8] bg-white text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20"
                  onKeyDown={(e) => e.key === "Enter" && handleForgotSubmit(e)}
                />
                <button
                  type="button"
                  onClick={handleForgotSubmit}
                  disabled={forgotPending || !forgotEmail}
                  className="px-4 py-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  {forgotPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Senden
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Anmeldung..." : "Anmelden"}
      </button>

      {/* Kein Konto */}
      <p className="text-xs text-center text-[#2D2D2D]/40 mt-4">
        Kein Konto?{" "}
        {keinKontoSent ? (
          <span className="text-[#7B9E7B] font-medium">Nachricht gesendet – wir melden uns!</span>
        ) : (
          <button
            type="button"
            onClick={handleKeinKonto}
            disabled={keinKontoPending}
            className="text-[#C06B4A] hover:underline disabled:opacity-60"
          >
            {keinKontoPending ? "Senden..." : "Kontakt aufnehmen"}
          </button>
        )}
      </p>
    </form>
  );
}
