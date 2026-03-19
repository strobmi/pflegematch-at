"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { inviteTeamMember } from "@/app/(dashboard)/vermittler/team/actions";

export default function TeamInviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await inviteTeamMember(email);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setEmail("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-Mail-Adresse"
        required
        className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EAD9C8] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C06B4A]/30 focus:border-[#C06B4A]"
      />
      <button
        type="submit"
        disabled={loading || !email}
        className="inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mail className="w-4 h-4" />
        )}
        Einladen
      </button>
      {error && (
        <p className="absolute mt-11 text-xs text-red-600">{error}</p>
      )}
      {success && (
        <p className="absolute mt-11 text-xs text-[#7B9E7B]">Einladung verschickt.</p>
      )}
    </form>
  );
}
