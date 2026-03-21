"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Heart, LayoutGrid, Users, HeartHandshake, Link2, LogOut, Inbox, User, Menu, X } from "lucide-react";

const navItems = [
  { href: "/vermittler",           label: "Übersicht",    icon: LayoutGrid },
  { href: "/vermittler/profil",    label: "Profil",       icon: User },
  { href: "/vermittler/pfleger",   label: "Pflegekräfte", icon: Users },
  { href: "/vermittler/klienten",  label: "Klienten",     icon: HeartHandshake },
  { href: "/vermittler/anfragen",  label: "Anfragen",     icon: Inbox },
  { href: "/vermittler/matches",   label: "Matches",      icon: Link2 },
];

export default function VermittlerSidebar({
  tenantName,
  userName,
}: {
  tenantName: string;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  function isActive(href: string) {
    if (href === "/vermittler") return pathname === "/vermittler";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-[#EAD9C8] shadow-sm"
        aria-label="Menü öffnen"
      >
        <Menu className="w-5 h-5 text-[#2D2D2D]" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 flex-shrink-0 bg-white border-r border-[#EAD9C8] flex flex-col h-full
        transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        {/* Close button (mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[#F5EDE3]"
          aria-label="Menü schließen"
        >
          <X className="w-4 h-4 text-[#2D2D2D]/60" />
        </button>

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
          <div className="pl-9 flex items-center gap-2">
            <span className="text-xs text-[#2D2D2D]/45 truncate">{tenantName}</span>
            <span className="text-[10px] font-semibold text-[#C06B4A] bg-[#C06B4A]/10 px-1.5 py-0.5 rounded-full shrink-0">Vermittler</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
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

        {/* User + Sign out */}
        <div className="px-3 pb-5 border-t border-[#EAD9C8] pt-3 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-[#C06B4A]/15 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#C06B4A]">{initials}</span>
            </div>
            <span className="text-sm font-medium text-[#2D2D2D] truncate">{userName ?? "–"}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#2D2D2D]/55 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}
