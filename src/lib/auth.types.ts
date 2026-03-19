import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      tenantId: string | null;
      tenantSlug: string | null;
      tenantName: string | null;
    };
  }
}

// JWT augmentation is handled via the session callback in auth.ts
// next-auth/jwt sub-module not available in NextAuth v5 beta
