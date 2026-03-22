import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ – pflegematch AT",
};

const faqs = [
  {
    section: "Allgemeines",
    items: [
      {
        q: "Was ist pflegematch?",
        a: "pflegematch ist eine österreichische Plattform, die pflegebedürftige Menschen und ihre Familien mit geprüften, professionellen Pflegekräften zusammenbringt. Unser intelligenter Matching-Algorithmus berücksichtigt Pflegebedarf, Sprache, Standort und persönliche Präferenzen — für eine Vermittlung, die wirklich passt.",
      },
      {
        q: "Für wen ist pflegematch geeignet?",
        a: "pflegematch richtet sich an Familien, die eine Pflegekraft für sich selbst, Eltern, Partner oder andere Angehörige suchen. Wir vermitteln für verschiedene Betreuungsformen: 24h-Pflege, stundenweise Betreuung, Tagesbetreuung und Nachtsitzung.",
      },
      {
        q: "In welchen Regionen ist pflegematch verfügbar?",
        a: "Wir sind österreichweit tätig. Unsere Pflegekräfte sind in Wien, Niederösterreich, Oberösterreich, der Steiermark, Salzburg, Tirol, Vorarlberg, Kärnten und dem Burgenland verfügbar.",
      },
    ],
  },
  {
    section: "Vermittlung & Ablauf",
    items: [
      {
        q: "Wie läuft die Vermittlung ab?",
        a: "Der Prozess ist einfach: (1) Sie füllen unseren Fragebogen aus und schildern Ihren Bedarf. (2) Unser Team analysiert Ihre Anforderungen und schlägt passende Pflegekräfte vor. (3) Sie führen ein kostenloses Kennenlerngespräch per Video. (4) Wenn die Chemie stimmt, erstellen wir gemeinsam den Betreuungsvertrag.",
      },
      {
        q: "Wie lange dauert die Vermittlung?",
        a: "In der Regel erhalten Sie innerhalb von 24 Stunden eine erste Rückmeldung. Das Kennenlerngespräch kann meist innerhalb von 5–7 Werktagen stattfinden. Bei dringendem Bedarf bemühen wir uns um eine beschleunigte Vermittlung.",
      },
      {
        q: "Was ist ein Kennenlerngespräch?",
        a: "Bevor eine Pflegekraft das erste Mal bei Ihnen zu Hause ist, ermöglichen wir ein unverbindliches Videogespräch zwischen Ihnen und der Pflegekraft. So können Sie Fragen stellen, die Persönlichkeit kennenlernen und sichergehen, dass es menschlich passt — bequem von zuhause aus, ohne App-Installation.",
      },
      {
        q: "Kann ich die vorgeschlagene Pflegekraft ablehnen?",
        a: "Ja, selbstverständlich. Eine Vermittlung kommt nur zustande, wenn beide Seiten einverstanden sind. Sie können jederzeit einen anderen Vorschlag anfragen — ohne Zusatzkosten.",
      },
    ],
  },
  {
    section: "Kosten & Pflegegeld",
    items: [
      {
        q: "Was kostet die Vermittlung?",
        a: "Das Ausfüllen des Fragebogens und das Kennenlerngespräch sind kostenlos. Eine einmalige Vermittlungsgebühr wird erst bei erfolgreichem Vertragsabschluss fällig. Die genauen Konditionen erhalten Sie in Ihrem persönlichen Beratungsgespräch.",
      },
      {
        q: "Kann ich Pflegegeld für die Betreuung verwenden?",
        a: "Ja. Unsere Tarife sind auf das österreichische Pflegegeld (Stufen 1–7) abgestimmt. Wir beraten Sie gerne, welche Betreuungsform mit Ihrem Pflegegeldbescheid kombiniert werden kann.",
      },
      {
        q: "Gibt es laufende Monatsbeiträge?",
        a: "Je nach Vereinbarung kann eine monatliche Betreuungsgebühr anfallen, die den laufenden Koordinationsaufwand abdeckt. Details werden transparent im Vermittlungsvertrag festgehalten.",
      },
    ],
  },
  {
    section: "Pflegekräfte & Qualität",
    items: [
      {
        q: "Wie werden die Pflegekräfte geprüft?",
        a: "Alle Pflegekräfte durchlaufen einen mehrstufigen Prüfprozess: Überprüfung der Ausbildungsnachweise, Strafregisterauszug, persönliches Interview sowie Referenzprüfung. Nur wer alle Schritte besteht, wird auf der Plattform zugelassen.",
      },
      {
        q: "Sind die Pflegekräfte versichert?",
        a: "Ja. Alle vermittelten Pflegekräfte sind haftpflichtversichert. Wir empfehlen zusätzlich den Abschluss einer Haushaltsversicherung auf Seiten der Familie, um alle Eventualitäten abzudecken.",
      },
      {
        q: "Was passiert, wenn eine Pflegekraft ausfällt?",
        a: "Wir bemühen uns bei kurzfristigem Ausfall (Krankheit etc.) schnellstmöglich eine Vertretung zu organisieren. Sprechen Sie diesen Fall bitte direkt mit Ihrem Vermittler ab — wir finden gemeinsam eine Lösung.",
      },
    ],
  },
  {
    section: "Konto & Datenschutz",
    items: [
      {
        q: "Müssen Angehörige ein Konto erstellen?",
        a: "Nein. Sie können zunächst den Fragebogen anonym ausfüllen. Ein Konto ist optional und erleichtert die Kommunikation mit Ihrem Vermittler.",
      },
      {
        q: "Wie werden meine Daten verwendet?",
        a: "Ihre Daten werden ausschließlich zur Vermittlung verwendet und nicht an Dritte weitergegeben. Wir sind DSGVO-konform. Details finden Sie in unserer Datenschutzerklärung.",
      },
    ],
  },
];

export default function FAQ() {
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

        <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-3">Häufige Fragen</h1>
        <p className="text-[#2D2D2D]/55 mb-12 text-base">
          Nicht gefunden was Sie suchen?{" "}
          <a href="mailto:hallo@pflegematch.at" className="text-[#C06B4A] hover:underline">
            Schreiben Sie uns.
          </a>
        </p>

        <div className="space-y-12">
          {faqs.map((section) => (
            <div key={section.section}>
              <h2 className="text-xs font-semibold tracking-widest uppercase text-[#2D2D2D]/40 mb-5">
                {section.section}
              </h2>
              <div className="space-y-px">
                {section.items.map((item, i) => (
                  <div key={i} className="bg-white border border-[#EAD9C8] rounded-2xl p-6 space-y-2">
                    <p className="font-semibold text-[#2D2D2D]">{item.q}</p>
                    <p className="text-[#2D2D2D]/60 text-sm leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
