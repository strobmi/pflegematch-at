"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALES: { code: string; flag: string; label: string }[] = [
  { code: "de", flag: "🇦🇹", label: "Deutsch" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ro", flag: "🇷🇴", label: "Română" },
  { code: "hr", flag: "🇭🇷", label: "Hrvatski" },
];

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-[#EAD9C8]/50 transition-colors"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-semibold">{current.code.toUpperCase()}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl border border-[#EAD9C8] shadow-lg shadow-[#2D2D2D]/8 py-1 z-50">
          {LOCALES.map(({ code, flag, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setOpen(false);
                router.replace(pathname, { locale: code });
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                code === currentLocale
                  ? "text-[#C06B4A] font-semibold bg-[#FAF6F1]"
                  : "text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-[#FAF6F1]"
              }`}
            >
              <span className="text-base leading-none">{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
