"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { resetPassword } from "@/app/(auth)/login/actions";

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EAD9C8] shadow-sm p-8 text-center">
        <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-[#2D2D2D]">Ungültiger oder fehlender Reset-Link.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(token, password);
      if (!result.ok) {
        setError(result.error ?? "Ein Fehler ist aufgetreten.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    });
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  if (success) {
    return (
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EAD9C8] shadow-sm p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-[#7B9E7B] mx-auto mb-3" />
        <p className="text-sm font-medium text-[#2D2D2D]">Passwort erfolgreich geändert!</p>
        <p className="text-xs text-[#2D2D2D]/50 mt-1">Du wirst zur Anmeldung weitergeleitet...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-[#EAD9C8] shadow-sm p-8">
        <h1 className="text-xl font-bold text-[#2D2D2D] mb-1">Neues Passwort</h1>
        <p className="text-sm text-[#2D2D2D]/50 mb-6">Bitte wähle ein neues Passwort.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Neues Passwort</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 Zeichen"
                className={`${inputClass} pr-11`}
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

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1.5">Passwort bestätigen</label>
            <input
              type={showPw ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Passwort wiederholen"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Speichern..." : "Passwort speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EAD9C8] shadow-sm p-8 text-center">
          <Loader2 className="w-10 h-10 text-[#C06B4A] mx-auto mb-3 animate-spin" />
          <p className="text-sm text-[#2D2D2D]">Wird geladen...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
