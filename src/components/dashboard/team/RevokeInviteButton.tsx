"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { revokeInvite } from "@/app/(dashboard)/vermittler/team/actions";

interface Props {
  tokenId: string;
  email: string;
}

export default function RevokeInviteButton({ tokenId, email }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    if (!confirm(`Einladung an "${email}" wirklich widerrufen?`)) return;
    setLoading(true);
    await revokeInvite(tokenId);
    setLoading(false);
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-[#2D2D2D]/50 hover:text-red-600 disabled:opacity-40 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
      Widerrufen
    </button>
  );
}
