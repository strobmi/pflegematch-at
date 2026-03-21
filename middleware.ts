import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory Rate Limiter — 5 Versuche pro IP pro 15 Minuten
const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS   = 15 * 60 * 1000; // 15 Minuten
const MAX_ATTEMPTS = 5;

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_ATTEMPTS) return true;

  entry.count++;
  return false;
}

export function middleware(request: NextRequest) {
  if (
    request.method === "POST" &&
    request.nextUrl.pathname === "/api/auth/callback/credentials"
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Zu viele Anmeldeversuche. Bitte warte 15 Minuten." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
    "/api/auth/callback/credentials",
  ],
};
