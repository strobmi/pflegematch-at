"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { confirmEmailChange } from "@/lib/email-change-actions";

export default function ConfirmEmailChangePage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Ungültiger oder fehlender Bestätigungslink.");
      return;
    }

    confirmEmailChange(token).then((result) => {
      if (result.ok) {
        setState("success");
        setNewEmail(result.newEmail ?? "");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setState("error");
        setMessage(result.error ?? "Ein Fehler ist aufgetreten.");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (state === "loading") {
    return (
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EAD9C8] shadow-sm p-8 text-center">
        <Loader2 className="w-10 h-10 text-[#C06B4A] mx-auto mb-3 animate-spin" />
        <p className="text-sm text-[#2D2D2D]">E-Mail-Adresse wird bestätigt...</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EAD9C8] shadow-sm p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-[#7B9E7B] mx-auto mb-3" />
        <p className="text-sm font-medium text-[#2D2D2D]">E-Mail-Adresse erfolgreich geändert!</p>
        {newEmail && (
          <p className="text-sm text-[#2D2D2D]/70 mt-1">
            Ihre neue Adresse lautet <strong>{newEmail}</strong>.
          </p>
        )}
        <p className="text-xs text-[#2D2D2D]/50 mt-2">
          Bitte verwenden Sie diese beim nächsten Login.
        </p>
        <p className="text-xs text-[#2D2D2D]/40 mt-1">Sie werden zur Anmeldung weitergeleitet...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EAD9C8] shadow-sm p-8 text-center">
      <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="text-sm font-medium text-[#2D2D2D]">Bestätigung fehlgeschlagen</p>
      <p className="text-sm text-[#2D2D2D]/60 mt-1">{message}</p>
      <a
        href="/login"
        className="mt-5 inline-block text-sm text-[#C06B4A] hover:underline font-medium"
      >
        Zur Anmeldung
      </a>
    </div>
  );
}
