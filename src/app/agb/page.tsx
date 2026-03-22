import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB – pflegematch AT",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40">{title}</h2>
      <div className="text-base leading-relaxed text-[#2D2D2D]/70 space-y-3">{children}</div>
    </section>
  );
}

export default function AGB() {
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

        <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-3">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-sm text-[#2D2D2D]/40 mb-12">Stand: März 2026</p>

        <div className="space-y-10">
          <Section title="§ 1 Geltungsbereich">
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Leistungen der <span className="font-semibold text-[#2D2D2D]">Michael Strobl Consulting GmbH</span> (nachfolgend „pflegematch" oder „Anbieter"), 1020 Wien, Österreich, gegenüber ihren Kunden (nachfolgend „Auftraggeber").
            </p>
            <p>
              Mit der Nutzung der Plattform pflegematch.at oder der Beauftragung einer Vermittlungsleistung erklärt sich der Auftraggeber mit diesen AGB einverstanden. Abweichende Bedingungen des Auftraggebers werden nicht anerkannt, es sei denn, pflegematch stimmt diesen ausdrücklich schriftlich zu.
            </p>
          </Section>

          <Section title="§ 2 Leistungsgegenstand">
            <p>
              pflegematch erbringt Vermittlungsdienstleistungen zwischen Auftraggebern (Familien, Pflegebedürftige oder deren Angehörige) und selbstständigen oder angestellten Pflegekräften. Der Anbieter ist dabei als Vermittler tätig und wird nicht selbst Vertragspartei des Pflegevertrags zwischen Auftraggeber und Pflegekraft.
            </p>
            <p>Zu den Leistungen zählen insbesondere:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Aufnahme und Analyse des Pflegebedarfs</li>
              <li>Vorschlag geeigneter Pflegekräfte auf Basis eines Matching-Algorithmus</li>
              <li>Organisation von Kennenlerngesprächen per Videokonferenz</li>
              <li>Unterstützung bei der Vertragsgestaltung zwischen Auftraggeber und Pflegekraft</li>
              <li>Laufende Betreuung und Koordination nach Wunsch</li>
            </ul>
          </Section>

          <Section title="§ 3 Vertragsschluss">
            <p>
              Das Ausfüllen des Fragebogens auf pflegematch.at stellt eine unverbindliche Anfrage dar. Ein Vertragsverhältnis kommt erst mit der schriftlichen Bestätigung des Vermittlungsauftrags durch pflegematch zustande.
            </p>
          </Section>

          <Section title="§ 4 Vermittlungsgebühr">
            <p>
              Für die erfolgreiche Vermittlung einer Pflegekraft wird eine einmalige Vermittlungsgebühr fällig. Die genaue Höhe wird im individuellen Vermittlungsauftrag festgelegt und vor Vertragsschluss transparent kommuniziert.
            </p>
            <p>
              Die Vermittlungsgebühr ist mit Unterzeichnung des Betreuungsvertrags zwischen Auftraggeber und Pflegekraft fällig. Die Rechnung ist innerhalb von 14 Tagen zu begleichen.
            </p>
            <p>
              Optionale Zusatzleistungen (z. B. laufende Koordination, Vertretungsorganisation) werden gesondert vereinbart und in Rechnung gestellt.
            </p>
          </Section>

          <Section title="§ 5 Pflichten des Auftraggebers">
            <p>Der Auftraggeber verpflichtet sich:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Alle für die Vermittlung relevanten Angaben vollständig und wahrheitsgemäß zu machen</li>
              <li>Vermittelte Pflegekräfte nicht zu umgehen und direkt zu kontaktieren ohne Wissen von pflegematch (Abwerbeverbot für die Dauer von 24 Monaten ab Vermittlung)</li>
              <li>Die vereinbarte Vergütung an die Pflegekraft pünktlich zu entrichten</li>
              <li>pflegematch über wesentliche Änderungen des Pflegebedarfs zu informieren</li>
            </ul>
          </Section>

          <Section title="§ 6 Leistungen der Pflegekräfte">
            <p>
              pflegematch prüft alle Pflegekräfte sorgfältig (Ausbildungsnachweise, Strafregister, Referenzen). Dennoch übernimmt pflegematch keine Haftung für die konkrete Erbringung der Pflegeleistungen durch die vermittelte Pflegekraft. Der Pflegevertrag besteht ausschließlich zwischen dem Auftraggeber und der Pflegekraft.
            </p>
          </Section>

          <Section title="§ 7 Haftungsbeschränkung">
            <p>
              pflegematch haftet nur für Schäden, die auf grobe Fahrlässigkeit oder Vorsatz zurückzuführen sind. Für leichte Fahrlässigkeit haftet pflegematch nur bei Verletzung wesentlicher Vertragspflichten und nur in Höhe des typischerweise vorhersehbaren Schadens.
            </p>
            <p>
              Eine Haftung für mittelbare Schäden, entgangenen Gewinn oder Folgeschäden ist — soweit gesetzlich zulässig — ausgeschlossen.
            </p>
          </Section>

          <Section title="§ 8 Vertraulichkeit">
            <p>
              Beide Parteien verpflichten sich, alle im Rahmen der Geschäftsbeziehung erlangten vertraulichen Informationen geheim zu halten und nicht an Dritte weiterzugeben. Dies gilt insbesondere für persönliche Angaben zu Pflegebedürftigen und Pflegekräften.
            </p>
          </Section>

          <Section title="§ 9 Kündigung">
            <p>
              Der Vermittlungsauftrag kann von beiden Seiten jederzeit schriftlich gekündigt werden, solange noch keine erfolgreiche Vermittlung stattgefunden hat. Nach erfolgter Vermittlung ist die Gebühr gemäß § 4 zu entrichten.
            </p>
            <p>
              Der Betreuungsvertrag zwischen Auftraggeber und Pflegekraft kann unter den darin vereinbarten Bedingungen gekündigt werden. pflegematch ist dabei behilflich, eine Vertretung oder Nachfolge zu organisieren.
            </p>
          </Section>

          <Section title="§ 10 Datenschutz">
            <p>
              Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer{" "}
              <Link href="/datenschutz" className="text-[#C06B4A] hover:underline">
                Datenschutzerklärung
              </Link>.
            </p>
          </Section>

          <Section title="§ 11 Anwendbares Recht und Gerichtsstand">
            <p>
              Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis ist Wien, Österreich.
            </p>
          </Section>

          <Section title="§ 12 Salvatorische Klausel">
            <p>
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen am nächsten kommt.
            </p>
          </Section>

          <div className="pt-4 border-t border-[#EAD9C8]">
            <p className="text-sm text-[#2D2D2D]/40">
              Bei Fragen zu diesen AGB wenden Sie sich bitte an{" "}
              <a href="mailto:office@pflegematch.at" className="text-[#C06B4A] hover:underline">
                office@pflegematch.at
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
