import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireTenantSession() {
  const user = await requireSession();
  if (!user.tenantId) redirect("/login");
  return user as typeof user & { tenantId: string };
}

export async function assertTenantOwnership(resourceTenantId: string) {
  const user = await requireSession();
  if (user.role === "SUPERADMIN") return;
  if (user.tenantId !== resourceTenantId) notFound();
}
