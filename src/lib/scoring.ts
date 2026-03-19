// Pure scoring utility — no Prisma imports, runs in browser and server

const AVAIL_MAP: Partial<Record<string, string[]>> = {
  "24h":            ["LIVE_IN"],
  "stundenweise":   ["HOURLY", "PART_TIME"],
  "tagesbetreuung": ["PART_TIME"],
  "nachtsitzung":   ["PART_TIME", "HOURLY"],
};

export interface ScoredCaregiver {
  pflegestufe: string[];
  languages: string[];
  availability: string;
  averageRating: number | null;
}

export interface ScoredRequest {
  pflegegeldStufe: string | null;
  careNeedsRaw: string | null;
}

export interface ScoreResult {
  score: number;
  pflegestufe: boolean;
  betreuungsart: boolean;
  sprachen: { matched: number; total: number };
}

export function computeScore(
  caregiver: ScoredCaregiver,
  request: ScoredRequest
): ScoreResult {
  let score = 0;

  let raw: Record<string, unknown> = {};
  try {
    raw = request.careNeedsRaw ? JSON.parse(request.careNeedsRaw) : {};
  } catch {
    // ignore malformed JSON
  }

  // Pflegestufe (40 Punkte)
  const pflegestufe =
    !!request.pflegegeldStufe &&
    caregiver.pflegestufe.includes(request.pflegegeldStufe);
  if (pflegestufe) score += 40;

  // Betreuungsart / Availability (30 Punkte)
  const betreuungsart_raw = raw.betreuungsart as string | undefined;
  const expected = betreuungsart_raw ? (AVAIL_MAP[betreuungsart_raw] ?? []) : [];
  const betreuungsart =
    expected.length === 0 || expected.includes(caregiver.availability);
  if (betreuungsart) score += 30;

  // Sprachen (20 Punkte)
  const requestedLangs = Array.isArray(raw.sprachen)
    ? (raw.sprachen as { lang: string }[])
    : [];
  const sprachen = {
    matched: requestedLangs.filter((s) => caregiver.languages.includes(s.lang)).length,
    total: requestedLangs.length,
  };
  if (sprachen.total === 0) {
    score += 10;
  } else {
    score += Math.round((sprachen.matched / sprachen.total) * 20);
  }

  // Bewertungs-Bonus (10 Punkte)
  if (caregiver.averageRating) {
    score += Math.round((caregiver.averageRating / 5) * 10);
  }

  return { score, pflegestufe, betreuungsart, sprachen };
}
