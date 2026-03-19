import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/api/auth"];
const STATIC_PREFIXES = ["/_next", "/favicon", "/public", "/robots.txt"];

const ROLE_PREFIXES: Record<string, string[]> = {
  "/admin":      ["SUPERADMIN"],
  "/vermittler": ["VERMITTLER_ADMIN", "SUPERADMIN"],
  "/pfleger":    ["PFLEGER", "SUPERADMIN"],
  "/kunde":      ["KUNDE", "SUPERADMIN"],
};

function getRoleDashboard(role: string): string {
  switch (role) {
    case "SUPERADMIN":       return "/admin";
    case "VERMITTLER_ADMIN": return "/vermittler";
    case "PFLEGER":          return "/pfleger";
    case "KUNDE":            return "/kunde";
    default:                 return "/login";
  }
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Static assets & public paths — always allowed
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const session = (req as NextRequest & { auth: { user?: { role: string } } | null }).auth;

  // Not authenticated → login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const role = session.user.role;

  // Role-based access check
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
