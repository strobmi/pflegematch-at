import { PrismaClient, Role, TenantStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Superadmin ─────────────────────────────────────────────
  const superadminEmail = process.env.SEED_SUPERADMIN_EMAIL ?? "admin@pflegematch.at";
  const superadminPassword = process.env.SEED_SUPERADMIN_PASSWORD ?? "Admin1234!";

  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {},
    create: {
      email: superadminEmail,
      name: "Platform Admin",
      passwordHash: await hash(superadminPassword, 12),
      role: Role.SUPERADMIN,
    },
  });
  console.log(`✓ Superadmin: ${superadmin.email}`);

  // ── Demo Tenant (Vermittler-Firma) ─────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-pflegedienst" },
    update: {},
    create: {
      name: "Demo Pflegedienst Wien GmbH",
      slug: "demo-pflegedienst",
      email: "office@demo-pflegedienst.at",
      phone: "+43 1 234 5678",
      address: "Mariahilfer Straße 50, 1060 Wien",
      status: TenantStatus.ACTIVE,
    },
  });
  console.log(`✓ Tenant: ${tenant.name}`);

  // ── Vermittler Admin für Demo Tenant ───────────────────────
  const vermittlerEmail = process.env.SEED_VERMITTLER_EMAIL ?? "vermittler@demo-pflegedienst.at";
  const vermittlerPassword = process.env.SEED_VERMITTLER_PASSWORD ?? "Vermittler1234!";

  const vermittler = await prisma.user.upsert({
    where: { email: vermittlerEmail },
    update: {},
    create: {
      email: vermittlerEmail,
      name: "Anna Vermittler",
      passwordHash: await hash(vermittlerPassword, 12),
      role: Role.VERMITTLER_ADMIN,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: vermittler.id, tenantId: tenant.id } },
    update: {},
    create: {
      userId: vermittler.id,
      tenantId: tenant.id,
      role: Role.VERMITTLER_ADMIN,
    },
  });
  console.log(`✓ Vermittler: ${vermittler.email}`);

  console.log("\n✅ Seed completed.");
  console.log(`\nLogin credentials:`);
  console.log(`  Superadmin: ${superadminEmail} / ${superadminPassword}`);
  console.log(`  Vermittler: ${vermittlerEmail} / ${vermittlerPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
