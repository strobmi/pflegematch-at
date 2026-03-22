import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – pflegematch AT",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40">{title}</h2>
      <div className="text-base leading-relaxed text-[#2D2D2D]/70 space-y-3">{children}</div>
    </section>
  );
}

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-[#FAF6F1]">
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

        <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-3">Datenschutzerklärung</h1>
        <p className="text-sm text-[#2D2D2D]/40 mb-12">Stand: März 2026</p>

        <div className="space-y-10">
          <Section title="1. Verantwortlicher">
            <p>
              Verantwortlicher im Sinne der DSGVO ist:<br />
              <span className="font-semibold text-[#2D2D2D]">Michael Strobl Consulting GmbH</span><br />
              1020 Wien, Österreich<br />
              E-Mail:{" "}
              <a href="mailto:datenschutz@pflegematch.at" className="text-[#C06B4A] hover:underline">
                datenschutz@pflegematch.at
              </a>
            </p>
          </Section>

          <Section title="2. Erhebung und Verwendung personenbezogener Daten">
            <p>
              Wir erheben personenbezogene Daten nur, soweit dies zur Bereitstellung unserer Dienstleistung erforderlich ist. Dazu gehören:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Kontaktdaten (Name, E-Mail-Adresse, Telefonnummer)</li>
              <li>Angaben zum Pflegebedarf (Pflegestufe, Betreuungsart, Standort)</li>
              <li>Sprachpräferenzen und Terminwünsche</li>
              <li>Zugangsdaten bei Registrierung auf der Plattform</li>
            </ul>
            <p>
              Diese Daten verwenden wir ausschließlich zur Vermittlung passender Pflegekräfte sowie zur Kommunikation mit Ihnen im Rahmen unserer Dienstleistung.
            </p>
          </Section>

          <Section title="3. Rechtsgrundlage der Verarbeitung">
            <p>
              Die Verarbeitung Ihrer Daten erfolgt auf Basis von:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) — für die Abwicklung der Vermittlung</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) — für den Newsletter oder optionale Dienste</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) — für die Sicherheit und Verbesserung unserer Plattform</li>
            </ul>
          </Section>

          <Section title="4. Weitergabe an Dritte">
            <p>
              Ihre personenbezogenen Daten werden nicht an Dritte zu Werbezwecken weitergegeben. Eine Weitergabe erfolgt nur:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>An Pflegekräfte, soweit dies zur Durchführung der Vermittlung notwendig ist (nach Ihrer Zustimmung)</li>
              <li>An technische Dienstleister (Hosting, E-Mail-Versand) im Rahmen der Auftragsverarbeitung gemäß Art. 28 DSGVO</li>
              <li>An Behörden, wenn wir gesetzlich dazu verpflichtet sind</li>
            </ul>
          </Section>

          <Section title="5. Verwendete Dienste">
            <p>
              Wir setzen folgende Drittanbieter ein, die Ihre Daten als Auftragsverarbeiter verarbeiten können:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><span className="font-medium text-[#2D2D2D]">Resend</span> — E-Mail-Versand (Anfragen-Benachrichtigungen)</li>
              <li><span className="font-medium text-[#2D2D2D]">Whereby</span> — Videogespräche (Kennenlerngespräche)</li>
              <li><span className="font-medium text-[#2D2D2D]">Hostinger</span> — Hosting und Infrastruktur</li>
            </ul>
            <p>Mit allen Dienstleistern bestehen Auftragsverarbeitungsverträge gemäß Art. 28 DSGVO.</p>
          </Section>

          <Section title="6. Cookies und Tracking">
            <p>
              Unsere Website verwendet ausschließlich technisch notwendige Cookies (Session-Cookies für die Anmeldung). Wir setzen kein Tracking, keine Analyse-Tools und keine Werbe-Cookies ein.
            </p>
          </Section>

          <Section title="7. Datenspeicherung und Löschung">
            <p>
              Wir speichern Ihre Daten nur so lange, wie es für die Erfüllung unserer Dienstleistung erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen (in der Regel 7 Jahre für buchhalterisch relevante Dokumente gemäß UGB). Danach werden Ihre Daten gelöscht oder anonymisiert.
            </p>
          </Section>

          <Section title="8. Ihre Rechte">
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><span className="font-medium text-[#2D2D2D]">Auskunft</span> — welche Daten wir über Sie gespeichert haben (Art. 15 DSGVO)</li>
              <li><span className="font-medium text-[#2D2D2D]">Berichtigung</span> — unrichtiger oder unvollständiger Daten (Art. 16 DSGVO)</li>
              <li><span className="font-medium text-[#2D2D2D]">Löschung</span> — Ihrer Daten, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen (Art. 17 DSGVO)</li>
              <li><span className="font-medium text-[#2D2D2D]">Einschränkung</span> der Verarbeitung (Art. 18 DSGVO)</li>
              <li><span className="font-medium text-[#2D2D2D]">Datenübertragbarkeit</span> (Art. 20 DSGVO)</li>
              <li><span className="font-medium text-[#2D2D2D]">Widerspruch</span> gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{" "}
              <a href="mailto:datenschutz@pflegematch.at" className="text-[#C06B4A] hover:underline">
                datenschutz@pflegematch.at
              </a>
            </p>
          </Section>

          <Section title="9. Beschwerderecht">
            <p>
              Sie haben das Recht, bei der österreichischen Datenschutzbehörde Beschwerde einzulegen:
            </p>
            <p>
              Österreichische Datenschutzbehörde<br />
              Barichgasse 40–42, 1030 Wien<br />
              <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-[#C06B4A] hover:underline">
                www.dsb.gv.at
              </a>
            </p>
          </Section>

          <Section title="10. Änderungen dieser Erklärung">
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die jeweils aktuelle Version ist auf dieser Seite abrufbar. Bei wesentlichen Änderungen informieren wir Sie per E-Mail.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
