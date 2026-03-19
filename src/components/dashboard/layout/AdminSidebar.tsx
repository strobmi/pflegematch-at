"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Heart, LayoutGrid, Building2, Users, LogOut, Link2, Inbox } from "lucide-react";

const navItems = [
  { href: "/admin",          label: "Übersicht",  icon: LayoutGrid },
  { href: "/admin/tenants",  label: "Vermittler", icon: Building2 },
  { href: "/admin/users",    label: "Alle User",  icon: Users },
  { href: "/admin/anfragen", label: "Anfragen",   icon: Inbox },
  { href: "/admin/matches",  label: "Matches",    icon: Link2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-[#2D2D2D] flex flex-col h-full">
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
  );
}
