"use client";

import { useState, useTransition } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { changePassword } from "@/lib/password-change-actions";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setErrorMsg("Die neuen Passwörter stimmen nicht überein.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setErrorMsg("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    startTransition(async () => {
      const result = await changePassword(currentPassword, newPassword);
      if (result.ok) {
        setStatus("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[#2D2D2D]/70 uppercase tracking-wide">Passwort ändern</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Aktuelles Passwort</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/40 hover:text-[#2D2D2D]/70 transition-colors"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Neues Passwort</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/40 hover:text-[#2D2D2D]/70 transition-colors"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">Neues Passwort wiederholen</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D2D2D]/40 hover:text-[#2D2D2D]/70 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {status === "success" && (
          <p className="text-sm text-[#7B9E7B] bg-[#7B9E7B]/10 px-3 py-2 rounded-lg">
            Passwort wurde erfolgreich geändert.
          </p>
        )}
        {status === "error" && errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
          className="bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Wird geändert..." : "Passwort ändern"}
        </button>
      </form>
    </div>
  );
}
