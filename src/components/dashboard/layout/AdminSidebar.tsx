"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Heart, LayoutGrid, Building2, Users, LogOut, Link2, Inbox, Menu, X } from "lucide-react";

const navItems = [
  { href: "/admin",          label: "Übersicht",  icon: LayoutGrid },
  { href: "/admin/tenants",  label: "Vermittler", icon: Building2 },
  { href: "/admin/users",    label: "Alle User",  icon: Users },
  { href: "/admin/anfragen", label: "Anfragen",   icon: Inbox },
  { href: "/admin/matches",  label: "Matches",    icon: Link2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-[#2D2D2D] border border-white/10 shadow-sm"
        aria-label="Menü öffnen"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-64 flex-shrink-0 bg-[#2D2D2D] flex flex-col h-full
        transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
        {/* Close button (mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Menü schließen"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#C06B4A] flex items-center justify-center flex-shrink-0">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-base font-bold text-white">
              pflege<span className="text-[#C06B4A]">match</span>
              <span className="text-[10px] align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
            </span>
          </Link>
          <p className="text-[10px] text-white/40 pl-9">Superadmin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-white/10 pt-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}
