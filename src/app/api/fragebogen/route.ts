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

// Maps fragebogen pflegestufe values to Prisma enum
const PFLEGESTUFE_ENUM: Record<string, string> = {
  stufe_1: "STUFE_1",
  stufe_2: "STUFE_2",
  stufe_3: "STUFE_3",
  stufe_45: "STUFE_4",
};

// ─── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (isRateLimited(req)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    );
  }

  const data = await req.json();

  const { pflegestufe, prioritaeten, name, email, telefon } = data;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name und E-Mail sind erforderlich." }, { status: 400 });
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
    // DB save is best-effort
    console.error("DB save failed:", err);
  }

  return NextResponse.json({ success: true });
}
