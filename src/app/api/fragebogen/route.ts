import { Resend } from "resend";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoAssignByScore } from "@/lib/assignRequest";

export const dynamic = "force-dynamic";

// ─── Rate Limiting: 5 Anfragen pro IP pro Stunde ───────────────────────────────
const submissions = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(req: Request): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const now     = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 Stunde
  const max      = 5;
  const entry   = submissions.get(ip);
  if (!entry || now > entry.resetAt) {
    submissions.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

// ─── Label helpers ─────────────────────────────────────────────────────────────

const FUER_WEN: Record<string, string> = {
  ich: "Für mich selbst",
  elternteil: "Für Mutter / Vater",
  partner: "Für Partner/-in",
  andere: "Für jemand anderen",
};

const BETREUUNGSART: Record<string, string> = {
  "24h": "24h-Pflege",
  stundenweise: "Stundenweise",
  tagesbetreuung: "Tagesbetreuung",
  nachtsitzung: "Nachtsitzung",
};

const PFLEGESTUFE: Record<string, string> = {
  keine: "Kein Pflegegeld",
  stufe_1: "Pflegestufe 1",
  stufe_2: "Pflegestufe 2",
  stufe_3: "Pflegestufe 3",
  stufe_45: "Pflegestufe 4–5",
  unbekannt: "Weiß noch nicht",
};

const MOBILITAET: Record<string, string> = {
  selbstaendig: "Selbständig",
  mit_hilfe: "Mit Unterstützung",
  rollstuhl: "Rollstuhlfahrer/-in",
  bettlaegerig: "Bettlägerig",
};

const DEMENZ: Record<string, string> = {
  nein: "Nein",
  leicht: "Leichte Anzeichen",
  ja: "Ja, diagnostiziert",
};

const UNTERKUNFT: Record<string, string> = {
  ja: "Ja, eigenes Zimmer vorhanden",
  nein: "Nein, externe Unterkunft nötig",
};

const START_ZEIT: Record<string, string> = {
  sofort: "So bald wie möglich",
  ein_zwei_wochen: "In 1–2 Wochen",
  ein_monat: "In ca. 1 Monat",
  unklar: "Noch nicht bekannt",
};

const DAUER: Record<string, string> = {
  dauerhaft: "Dauerhaft",
  monate: "Mehrere Monate",
  wochen: "Einige Wochen",
  unklar: "Noch nicht bekannt",
};

// Maps fragebogen pflegestufe values to Prisma enum
const PFLEGESTUFE_ENUM: Record<string, string> = {
  stufe_1: "STUFE_1",
  stufe_2: "STUFE_2",
  stufe_3: "STUFE_3",
  stufe_45: "STUFE_4",
};

function row(label: string, value: string) {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px 6px 0;color:#666;white-space:nowrap;vertical-align:top"><strong>${label}</strong></td><td style="padding:6px 0;color:#2D2D2D">${value}</td></tr>`;
}

// ─── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (isRateLimited(req)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    );
  }

  const data = await req.json();

  const {
    fuerWen, betreuungsart, pflegestufe, mobilitaet, demenz,
    unterkunft, startZeit, dauer, sprachen, ort,
    prioritaeten, name, email, telefon,
  } = data;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name und E-Mail sind erforderlich." }, { status: 400 });
  }

  // ── Email ──────────────────────────────────────────────────────────────────

  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2D2D2D">
      <div style="background:#C06B4A;padding:24px 28px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">Neue Pflegeanfrage über pflegematch.at</h1>
        <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:14px">Fragebogen ausgefüllt am ${new Date().toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" })}</p>
      </div>
      <div style="background:#fff;padding:24px 28px;border:1px solid #EAD9C8;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="font-size:15px;color:#C06B4A;margin:0 0 12px">Kontaktdaten</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
          ${row("Name:", name)}
          ${row("E-Mail:", email)}
          ${row("Telefon:", telefon || "–")}
        </table>

        <h2 style="font-size:15px;color:#C06B4A;margin:0 0 12px">Pflegebedarf</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
          ${row("Für wen:", FUER_WEN[fuerWen] || fuerWen || "–")}
          ${row("Betreuungsart:", BETREUUNGSART[betreuungsart] || betreuungsart || "–")}
          ${row("Pflegestufe:", PFLEGESTUFE[pflegestufe] || pflegestufe || "–")}
          ${row("Mobilität:", MOBILITAET[mobilitaet] || mobilitaet || "–")}
          ${row("Demenz:", DEMENZ[demenz] || demenz || "–")}
          ${row("Unterkunft:", UNTERKUNFT[unterkunft] || unterkunft || "–")}
        </table>

        <h2 style="font-size:15px;color:#C06B4A;margin:0 0 12px">Zeitplan & Standort</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
          ${row("Ab wann:", START_ZEIT[startZeit] || startZeit || "–")}
          ${row("Wie lange:", DAUER[dauer] || dauer || "–")}
          ${row("Standort:", ort || "–")}
          ${row("Sprachen:", Array.isArray(sprachen) && sprachen.length > 0
            ? sprachen.map((s: { lang: string; level: string }) => {
                const levelLabel: Record<string, string> = { grundkenntnisse: "Grundkenntnisse", fliessend: "Fließend", muttersprache: "Muttersprache" };
                return `${s.lang} (${levelLabel[s.level] ?? s.level})`;
              }).join(", ")
            : "–")}
        </table>

        ${prioritaeten ? `
        <h2 style="font-size:15px;color:#C06B4A;margin:0 0 8px">Persönliche Nachricht</h2>
        <p style="background:#FAF6F1;border-left:3px solid #C06B4A;padding:12px 16px;border-radius:0 8px 8px 0;margin:0;font-size:14px;line-height:1.6">${prioritaeten}</p>
        ` : ""}

        ${Array.isArray(data.wunschtermine) && data.wunschtermine.length > 0 ? `
        <h2 style="font-size:15px;color:#C06B4A;margin:16px 0 8px">Wunschtermine für Kennenlerngespräch</h2>
        <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
          ${(data.wunschtermine as Array<{ dateTime: string; durationMin: number }>).map((s, i) => {
            const d = new Date(s.dateTime);
            const label = d.toLocaleDateString("de-AT", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })
              + " · " + d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })
              + ` Uhr (${s.durationMin} Min.)`;
            return row(`${i + 1}. Termin:`, label);
          }).join("")}
        </table>
        ` : ""}
      </div>
    </div>
  `;

  const { error: emailError } = await resend.emails.send({
    from: "pflegematch.at <noreply@pflegematch.at>",
    to: "office@ms-consulting.at",
    replyTo: email,
    subject: `Neue Pflegeanfrage von ${name}`,
    html,
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json({ error: emailError.message }, { status: 500 });
  }

  // ── DB Save (Phase 1: MatchRequest) ────────────────────────────────────────
  // Leads landen beim Plattform-Tenant (isPlatform: true).
  // Phase 2: matching algorithm läuft und weist Vermittler zu.

  try {
    const platformTenant = await prisma.tenant.findFirst({
      where: { isPlatform: true },
      select: { id: true },
    });

    if (platformTenant) {
      const mr = await prisma.matchRequest.create({
        data: {
          tenantId: platformTenant.id,
          contactName: name,
          contactEmail: email,
          contactPhone: telefon || null,
          pflegegeldStufe: (PFLEGESTUFE_ENUM[pflegestufe] as never) ?? null,
          careNeedsRaw: JSON.stringify(data),
          notes: prioritaeten || null,
        },
      });
      // Score-basierte Zuweisung: besten Vermittler anhand verfügbarer Pfleger ermitteln
      await autoAssignByScore(mr.id);
    }
  } catch (err) {
    // DB save is best-effort — email was already sent
    console.error("DB save failed:", err);
  }

  return NextResponse.json({ success: true });
}
