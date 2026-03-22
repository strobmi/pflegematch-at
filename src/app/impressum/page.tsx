import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum – pflegematch AT",
};

export default function Impressum() {
  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Minimal Header */}
      <header className="border-b border-[#EAD9C8] bg-white px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#C06B4A] flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-base font-bold text-[#2D2D2D]">
            pflege<span className="text-[#C06B4A]">match</span>
            <span className="text-[10px] align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
          </span>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14 lg:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#2D2D2D]/50 hover:text-[#C06B4A] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-12">Impressum</h1>

        <div className="space-y-10 text-[#2D2D2D]">
          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40 mb-3">
              Angaben gemäß § 5 ECG
            </h2>
            <div className="space-y-1 text-base leading-relaxed">
              <p className="font-semibold">Michael Strobl Consulting GmbH</p>
              <p>1020 Wien, Österreich</p>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40 mb-3">
              Kontakt
            </h2>
            <p className="text-base leading-relaxed">
              E-Mail:{" "}
              <a href="mailto:office@pflegematch.at" className="text-[#C06B4A] hover:underline">
                office@pflegematch.at
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40 mb-3">
              Unternehmensregistrierung
            </h2>
            <div className="space-y-1 text-base leading-relaxed">
              <p>Firmenbuchnummer: FN 615226w</p>
              <p>Firmenbuchgericht: Handelsgericht Wien</p>
              <p>UID-Nummer: ATU80084659</p>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40 mb-3">
              Unternehmensgegenstand
            </h2>
            <p className="text-base leading-relaxed">
              Pflegevermittlung und digitale Plattformdienstleistungen
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40 mb-3">
              Kammermitgliedschaft
            </h2>
            <div className="space-y-1 text-base leading-relaxed">
              <p>Mitglied der Wirtschaftskammer Wien</p>
              <p>Fachgruppe Wien Unternehmensberatung, Buchhaltung und Informationstechnologie</p>
              <p className="mt-2">
                <a
                  href="https://firmen.wko.at/michael-strobl-consulting-gmbh-digitalisierungs-und-consulting-services/wien/?firmaid=31b5a57d-3913-4909-bb91-b8aec83ab328"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C06B4A] hover:underline"
                >
                  WKO Firmenprofil →
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40 mb-3">
              Haftungsausschluss
            </h2>
            <p className="text-base leading-relaxed text-[#2D2D2D]/60">
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch
              keine Gewähr übernommen werden. Als Diensteanbieter sind wir gemäß § 7 Abs. 1
              TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
