"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Heart, LayoutGrid, Users, HeartHandshake, Link2, LogOut, Inbox } from "lucide-react";

const navItems = [
  { href: "/vermittler",           label: "Übersicht",    icon: LayoutGrid },
  { href: "/vermittler/pfleger",   label: "Pflegekräfte", icon: Users },
  { href: "/vermittler/klienten",  label: "Klienten",     icon: HeartHandshake },
  { href: "/vermittler/anfragen",  label: "Anfragen",     icon: Inbox },
  { href: "/vermittler/matches",   label: "Matches",      icon: Link2 },
];

export default function VermittlerSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/vermittler") return pathname === "/vermittler";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[#EAD9C8] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#EAD9C8]">
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#C06B4A] flex items-center justify-center flex-shrink-0">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-base font-bold text-[#2D2D2D]">
            pflege<span className="text-[#C06B4A]">match</span>
            <span className="text-[10px] align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
          </span>
        </Link>
        <p className="text-xs text-[#2D2D2D]/45 pl-9 truncate">{tenantName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-[#C06B4A]/10 text-[#C06B4A]"
                : "text-[#2D2D2D]/65 hover:bg-[#F5EDE3] hover:text-[#2D2D2D]"
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 border-t border-[#EAD9C8] pt-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#2D2D2D]/55 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
