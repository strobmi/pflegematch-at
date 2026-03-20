"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Heart, LayoutGrid, User, Calendar, Inbox, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PflegerSidebar({
  locale,
  userName,
}: {
  locale: string;
  userName: string | null;
}) {
  const t = useTranslations("dashboard.pfleger.nav");
  const pathname = usePathname();

  const base = `/${locale}/dashboard/pfleger`;

  const navItems = [
    { href: base,                        label: t("overview"),     icon: LayoutGrid },
    { href: `${base}/profil`,            label: t("profile"),      icon: User },
    { href: `${base}/verfuegbarkeit`,    label: t("availability"), icon: Calendar },
    { href: `${base}/anfragen`,          label: t("requests"),     icon: Inbox },
  ];

  function isActive(href: string) {
    if (href === base) return pathname === base;
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
        <p className="text-xs text-[#2D2D2D]/45 pl-9 truncate">{userName ?? ""}</p>
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
          <UseCommonSignOut />
        </button>
      </div>
    </aside>
  );
}

function UseCommonSignOut() {
  const t = useTranslations("common");
  return <>{t("signOut")}</>;
}
