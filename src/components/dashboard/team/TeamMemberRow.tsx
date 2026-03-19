"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { removeTeamMember } from "@/app/(dashboard)/vermittler/team/actions";

interface Props {
  memberId: string;
  memberName: string;
  isSelf: boolean;
}

export default function TeamMemberRow({ memberId, memberName, isSelf }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (!confirm(`"${memberName}" wirklich aus dem Team entfernen?`)) return;
    setLoading(true);
    await removeTeamMember(memberId);
    setLoading(false);
  }

  if (isSelf) {
    return (
      <span className="text-xs text-[#2D2D2D]/30 px-3 py-1.5">Sie selbst</span>
    );
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      Entfernen
    </button>
  );
}
