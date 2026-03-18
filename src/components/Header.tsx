"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Heart } from "lucide-react";

const navLinks = [
  { label: "So funktioniert's", href: "#how-it-works" },
  { label: "Pflegekräfte", href: "#caregivers" },
  { label: "Kosten", href: "#pricing" },
  { label: "Über uns", href: "#about" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAF6F1]/95 backdrop-blur-md shadow-sm border-b border-[#EAD9C8]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#C06B4A] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-[#2D2D2D]">
              pflege<span className="text-[#C06B4A]">match</span>
              <span className="text-xs align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#2D2D2D]/70 hover:text-[#C06B4A] font-medium text-sm transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+43800123456"
              className="flex items-center gap-1.5 text-sm text-[#2D2D2D]/70 hover:text-[#C06B4A] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">0800 123 456</span>
            </a>
            <a
              href="#get-started"
              className="bg-[#C06B4A] hover:bg-[#A05438] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#C06B4A]/25"
            >
              Jetzt starten
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#2D2D2D]"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#FAF6F1] border-t border-[#EAD9C8]"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-[#2D2D2D]/70 hover:text-[#C06B4A] font-medium"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-[#EAD9C8]">
                <a
                  href="#get-started"
                  className="block w-full text-center bg-[#C06B4A] text-white px-5 py-3 rounded-full font-semibold"
                >
                  Jetzt starten
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
