"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
  acceptInviteNewUser,
  acceptInviteExistingUser,
} from "@/app/invite/[token]/actions";

interface BaseProps {
  token: string;
  email: string;
  tenantName: string;
}

export function NewUserAcceptForm({ token, email, tenantName }: BaseProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await acceptInviteNewUser(token, name, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/vermittler");
    } else {
      setError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#2D2D2D]/65">
        Sie wurden eingeladen, dem Team von <strong>{tenantName}</strong> beizutreten.
        Legen Sie Ihr Konto an, um fortzufahren.
      </p>
      <div>
        <label className="block text-xs font-semibold text-[#2D2D2D]/60 mb-1.5">
          E-Mail
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAD9C8] text-sm bg-[#FDFAF7] text-[#2D2D2D]/50 cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#2D2D2D]/60 mb-1.5">
          Vollständiger Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          placeholder="Max Mustermann"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAD9C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C06B4A]/30 focus:border-[#C06B4A]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#2D2D2D]/60 mb-1.5">
          Passwort
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          placeholder="Mindestens 8 Zeichen"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAD9C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C06B4A]/30 focus:border-[#C06B4A]"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#2D2D2D]/60 mb-1.5">
          Passwort bestätigen
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Passwort wiederholen"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAD9C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C06B4A]/30 focus:border-[#C06B4A]"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Konto erstellen & beitreten
      </button>
    </form>
  );
}

export function ExistingUserAcceptForm({ token, email, tenantName }: BaseProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await acceptInviteExistingUser(token, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/vermittler");
    } else {
      setError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#2D2D2D]/65">
        Sie wurden eingeladen, dem Team von <strong>{tenantName}</strong> beizutreten.
        Melden Sie sich mit Ihrem bestehenden Konto an.
      </p>
      <div>
        <label className="block text-xs font-semibold text-[#2D2D2D]/60 mb-1.5">
          E-Mail
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAD9C8] text-sm bg-[#FDFAF7] text-[#2D2D2D]/50 cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#2D2D2D]/60 mb-1.5">
          Passwort
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Ihr Passwort"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAD9C8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C06B4A]/30 focus:border-[#C06B4A]"
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C06B4A] hover:bg-[#A05438] disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Anmelden & beitreten
      </button>
    </form>
  );
}
