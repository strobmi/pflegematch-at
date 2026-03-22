"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { requestEmailChange } from "@/lib/email-change-actions";

interface Props {
  currentEmail: string;
  dark?: boolean;
}

export default function EmailChangeForm({ currentEmail, dark }: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputClass = dark
    ? "w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-white/30"
    : "w-full px-4 py-2.5 rounded-xl border border-[#EAD9C8] bg-[#FAF6F1] text-sm focus:outline-none focus:border-[#C06B4A] focus:ring-2 focus:ring-[#C06B4A]/20 transition-colors placeholder:text-[#2D2D2D]/35";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg(null);
    startTransition(async () => {
      const result = await requestEmailChange(newEmail);
      if (result.ok) {
        setStatus("success");
        setNewEmail("");
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      }
    });
  }

  const labelClass = dark ? "block text-xs font-medium text-white/50 mb-1.5" : "block text-xs font-medium text-[#2D2D2D]/70 mb-1.5";

  return (
    <div className={dark ? "bg-white/10 rounded-2xl border border-white/10 p-6 space-y-4" : "bg-white rounded-2xl border border-[#EAD9C8] p-6 space-y-4"}>
      <h2 className={dark ? "text-sm font-semibold text-white/50 uppercase tracking-wide" : "text-sm font-semibold text-[#2D2D2D]/70 uppercase tracking-wide"}>E-Mail-Adresse ändern</h2>
      <div>
        <label className={labelClass}>Aktuelle E-Mail-Adresse</label>
        <input value={currentEmail} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={labelClass}>Neue E-Mail-Adresse</label>
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="neue@adresse.at"
            className={inputClass}
          />
        </div>
        {status === "success" && (
          <p className="text-sm text-[#7B9E7B] bg-[#7B9E7B]/10 px-3 py-2 rounded-lg">
            Bestätigungslink wurde an Ihre neue Adresse gesendet. Bitte prüfen Sie Ihr Postfach.
          </p>
        )}
        {status === "error" && errorMsg && (
          <p className={dark ? "text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg" : "text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"}>{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={isPending || !newEmail}
          className="bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Wird gesendet..." : "Bestätigungslink senden"}
        </button>
      </form>
    </div>
  );
}
