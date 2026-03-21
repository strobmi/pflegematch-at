import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 Tage
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            memberships: {
              include: {
                tenant: {
                  select: { id: true, name: true, slug: true, status: true },
                },
              },
            },
          },
        });

        if (!user?.passwordHash) return null;

        const valid = await compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const activeMembership = user.memberships.find(
          (m) => m.tenant.status === "ACTIVE"
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: activeMembership?.tenantId ?? null,
          tenantSlug: activeMembership?.tenant.slug ?? null,
          tenantName: activeMembership?.tenant.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.tenantId = (user as { tenantId: string | null }).tenantId;
        token.tenantSlug = (user as { tenantSlug: string | null }).tenantSlug;
        token.tenantName = (user as { tenantName: string | null }).tenantName;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.tenantId = token.tenantId as string | null;
      session.user.tenantSlug = token.tenantSlug as string | null;
      session.user.tenantName = token.tenantName as string | null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
