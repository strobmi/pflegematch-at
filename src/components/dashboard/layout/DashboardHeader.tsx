"use client";

import { signOut } from "next-auth/react";
import { ChevronDown, User } from "lucide-react";
import { useState } from "react";

interface Props {
  userName: string | null;
  tenantName?: string | null;
}

export default function DashboardHeader({ userName, tenantName }: Props) {
  const [open, setOpen] = useState(false);
  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  return (
    <header className="h-14 border-b border-[#EAD9C8] bg-white flex items-center justify-between px-6">
      <div className="text-sm text-[#2D2D2D]/50">
        {tenantName && <span className="font-medium text-[#2D2D2D]">{tenantName}</span>}
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 hover:bg-[#F5EDE3] px-3 py-1.5 rounded-xl transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#C06B4A] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-[#2D2D2D] hidden sm:block">{userName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#2D2D2D]/40" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#EAD9C8] rounded-xl shadow-lg overflow-hidden z-50">
            <button className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[#2D2D2D]/70 hover:bg-[#F5EDE3] transition-colors">
              <User className="w-4 h-4" />
              Profil
            </button>
            <div className="border-t border-[#EAD9C8]" />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              Abmelden
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
