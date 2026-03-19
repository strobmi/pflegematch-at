"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      PFLEGER: "/pfleger",
      KUNDE: "/kunde",
    };

    router.push(redirectMap[role] ?? "/");
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
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">
          Passwort
        </label>
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

      <p className="text-xs text-center text-[#2D2D2D]/40 mt-4">
        Kein Konto? Kontaktieren Sie{" "}
        <a href="mailto:hallo@pflegematch.at" className="text-[#C06B4A] hover:underline">
          hallo@pflegematch.at
        </a>
      </p>
    </form>
  );
}
