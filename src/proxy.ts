import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

// Rate Limiting: 5 Login-Versuche pro IP pro 15 Minuten
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS    = 15 * 60 * 1000;
const MAX_ATTEMPTS = 50; // TODO: auf 5 reduzieren nach Testphase

function isRateLimited(ip: string): boolean {
  const now   = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_ATTEMPTS) return true;
  entry.count++;
  return false;
}

// Locale-prefixed paths handled by next-intl (de/en/ro/hr)
const LOCALE_PREFIX_RE = /^\/(de|en|ro|hr)(\/|$)/;

const PUBLIC_PATHS = ["/", "/login", "/api/auth", "/invite", "/faq", "/agb", "/datenschutz", "/impressum"];
const STATIC_PREFIXES = ["/_next", "/favicon", "/public", "/robots.txt"];

// Locale-prefixed public paths (registration, public profiles, direct requests)
const LOCALE_PUBLIC_RE = /^\/(de|en|ro|hr)\/(registrierung|pfleger)(\/|$)/;

const ROLE_PREFIXES: Record<string, string[]> = {
  "/admin":      ["SUPERADMIN"],
  "/vermittler": ["VERMITTLER_ADMIN", "SUPERADMIN"],
  "/pfleger":    ["PFLEGER", "SUPERADMIN"],
  "/kunde":      ["KUNDE", "SUPERADMIN"],
};

// Locale-prefixed role paths
const LOCALE_ROLE_PREFIXES: Record<string, string[]> = {
  "/dashboard/pfleger": ["PFLEGER", "SUPERADMIN"],
};

function getRoleDashboard(role: string): string {
  switch (role) {
    case "SUPERADMIN":       return "/admin";
    case "VERMITTLER_ADMIN": return "/vermittler";
    case "PFLEGER":          return "/de/dashboard/pfleger";
    case "KUNDE":            return "/kunde";
    default:                 return "/login";
  }
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rate Limiting auf Login-Endpoint
  if (req.method === "POST" && pathname === "/api/auth/callback/credentials") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Zu viele Anmeldeversuche. Bitte warte 15 Minuten." },
        { status: 429 }
      );
    }
  }

  // Static assets — always allowed
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Locale-prefixed public paths (registration, public profiles) — run intl middleware, no auth
  if (LOCALE_PUBLIC_RE.test(pathname)) {
    return intlMiddleware(req);
  }

  // Locale-prefixed paths — run intl middleware first, then check auth for dashboard paths
  if (LOCALE_PREFIX_RE.test(pathname)) {
    // Check auth for locale-prefixed dashboard paths
    const pathWithoutLocale = pathname.replace(/^\/(de|en|ro|hr)/, "");
    const session = (req as NextRequest & { auth: { user?: { role: string } } | null }).auth;

    for (const [prefix, allowed] of Object.entries(LOCALE_ROLE_PREFIXES)) {
      if (pathWithoutLocale.startsWith(prefix)) {
        if (!session?.user) {
          return NextResponse.redirect(new URL("/login", req.nextUrl));
        }
        if (!allowed.includes(session.user.role)) {
          return NextResponse.redirect(new URL(getRoleDashboard(session.user.role), req.nextUrl));
        }
      }
    }

    // Run next-intl middleware for locale-prefixed paths
    return intlMiddleware(req);
  }

  // Non-locale public paths — always allowed
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const session = (req as NextRequest & { auth: { user?: { role: string } } | null }).auth;

  // Not authenticated → login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const role = session.user.role;

  // Role-based access check for non-locale paths
  for (const [prefix, allowed] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix) && !allowed.includes(role)) {
      return NextResponse.redirect(new URL(getRoleDashboard(role), req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
