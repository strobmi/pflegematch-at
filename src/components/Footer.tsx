import { Heart } from "lucide-react";

const footerLinks = {
  "Plattform": [
    { label: "Wie es funktioniert", href: "#how-it-works" },
    { label: "Pflegekräfte finden", href: "#caregivers" },
    { label: "Preise", href: "#pricing" },
    { label: "Für Pflegekräfte", href: "#for-caregivers" },
  ],
  "Über uns": [
    { label: "Unser Team", href: "#team" },
    { label: "Mission", href: "#mission" },
    { label: "Presse", href: "#press" },
    { label: "Karriere", href: "#careers" },
  ],
  "Hilfe & Recht": [
    { label: "FAQ", href: "#faq" },
    { label: "Pflegegeld-Infos", href: "#pflegegeld" },
    { label: "Datenschutz", href: "#privacy" },
    { label: "AGB", href: "#terms" },
    { label: "Impressum", href: "/impressum" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#C06B4A] flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-xl font-bold">
                pflege<span className="text-[#C06B4A]">match</span>
                <span className="text-xs align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
              </span>
            </a>

            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-xs">
              Österreichs digitale Plattform für menschliche Pflegevermittlung. Wir verbinden Familien und Pflegekräfte mit Herz und Technologie.
            </p>

          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-white font-semibold text-sm mb-4">{category}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/35 text-xs">
            © {new Date().getFullYear()} pflegematch AT GmbH · Alle Rechte vorbehalten
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/35 flex items-center gap-1">
              <span>🇦🇹</span> Made in Austria
            </span>
            <div className="flex items-center gap-1 text-xs text-white/35">
              Gemacht mit
              <Heart className="w-3 h-3 text-[#C06B4A] fill-[#C06B4A]" />
              für die Pflege
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
