import { PrismaClient, Role, TenantStatus, MatchStatus } from "@prisma/client";
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

  // ── Plattform-Tenant (pflegematch.at selbst) ───────────────
  const platformTenant = await prisma.tenant.upsert({
    where: { slug: "platform" },
    update: {},
    create: {
      name: "pflegematch.at",
      slug: "platform",
      email: "office@pflegematch.at",
      status: TenantStatus.ACTIVE,
      isPlatform: true,
    },
  });
  console.log(`✓ Platform Tenant: ${platformTenant.name} (${platformTenant.id})`);

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
      provisionPercent: 12.5,
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

  // ── Pfleger 1: Marta Kovač ─────────────────────────────────
  const martaUser = await prisma.user.upsert({
    where: { email: "marta.kovac@demo-pflegedienst.at" },
    update: {},
    create: {
      email: "marta.kovac@demo-pflegedienst.at",
      name: "Marta Kovač",
      passwordHash: await hash("Pfleger1234!", 12),
      role: Role.PFLEGER,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: martaUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: martaUser.id, tenantId: tenant.id, role: Role.PFLEGER },
  });

  const martaProfile = await prisma.caregiverProfile.upsert({
    where: { userId: martaUser.id },
    update: {},
    create: {
      userId: martaUser.id,
      tenantId: tenant.id,
      bio: "Erfahrene 24h-Pflegekraft mit 8 Jahren Berufserfahrung.",
      languages: ["Kroatisch", "Deutsch"],
      qualifications: ["Heimhilfe", "Pflegeassistenz"],
      skills: ["Demenzpflege", "Mobilisierung", "Körperpflege"],
      pflegestufe: ["STUFE_2", "STUFE_3"],
      availability: "LIVE_IN",
      locationCity: "Wien",
      locationState: "Wien",
      travelRadius: 30,
      hourlyRate: 14.5,
      isActive: true,
      backgroundChecked: true,
    },
  });
  console.log(`✓ Pfleger: ${martaUser.name}`);

  // ── Pfleger 2: Stefan Huber ────────────────────────────────
  const stefanUser = await prisma.user.upsert({
    where: { email: "stefan.huber@demo-pflegedienst.at" },
    update: {},
    create: {
      email: "stefan.huber@demo-pflegedienst.at",
      name: "Stefan Huber",
      passwordHash: await hash("Pfleger1234!", 12),
      role: Role.PFLEGER,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: stefanUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: stefanUser.id, tenantId: tenant.id, role: Role.PFLEGER },
  });

  const stefanProfile = await prisma.caregiverProfile.upsert({
    where: { userId: stefanUser.id },
    update: {},
    create: {
      userId: stefanUser.id,
      tenantId: tenant.id,
      bio: "Diplomierter Gesundheits- und Krankenpfleger, spezialisiert auf Teilzeitbetreuung.",
      languages: ["Deutsch"],
      qualifications: ["DGKP", "Erste Hilfe"],
      skills: ["Wundversorgung", "Medikamentenverwaltung", "Sturzprophylaxe"],
      pflegestufe: ["STUFE_1", "STUFE_2"],
      availability: "PART_TIME",
      locationCity: "Wien",
      locationState: "Wien",
      travelRadius: 20,
      hourlyRate: 18.0,
      isActive: true,
      backgroundChecked: true,
    },
  });
  console.log(`✓ Pfleger: ${stefanUser.name}`);

  // ── Klient 1: Elisabeth Mayr ───────────────────────────────
  const elisabethUser = await prisma.user.upsert({
    where: { email: "familie.mayr@example.at" },
    update: {},
    create: {
      email: "familie.mayr@example.at",
      name: "Elisabeth Mayr",
      passwordHash: await hash("Klient1234!", 12),
      role: Role.KUNDE,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: elisabethUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: elisabethUser.id, tenantId: tenant.id, role: Role.KUNDE },
  });

  const elisabethProfile = await prisma.clientProfile.upsert({
    where: { userId: elisabethUser.id },
    update: {},
    create: {
      userId: elisabethUser.id,
      tenantId: tenant.id,
      careNeedsDescription: "24h-Betreuung nach Hüftoperation. Kroatischkenntnisse erwünscht.",
      pflegegeldStufe: "STUFE_2",
      preferredLanguages: ["Kroatisch", "Deutsch"],
      preferredSchedule: "LIVE_IN",
      locationCity: "Wien",
      locationState: "Wien",
      locationPostal: "1180",
      isActive: true,
    },
  });
  console.log(`✓ Klient: ${elisabethUser.name}`);

  // ── Klient 2: Hans Gruber ──────────────────────────────────
  const hansUser = await prisma.user.upsert({
    where: { email: "hans.gruber@example.at" },
    update: {},
    create: {
      email: "hans.gruber@example.at",
      name: "Hans Gruber",
      passwordHash: await hash("Klient1234!", 12),
      role: Role.KUNDE,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: hansUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: hansUser.id, tenantId: tenant.id, role: Role.KUNDE },
  });

  const hansProfile = await prisma.clientProfile.upsert({
    where: { userId: hansUser.id },
    update: {},
    create: {
      userId: hansUser.id,
      tenantId: tenant.id,
      careNeedsDescription: "Pflegestufe 3, Demenz im Frühstadium. Stundenweise Unterstützung.",
      pflegegeldStufe: "STUFE_3",
      preferredLanguages: ["Deutsch"],
      preferredSchedule: "PART_TIME",
      locationCity: "Wien",
      locationState: "Wien",
      locationPostal: "1100",
      isActive: true,
    },
  });
  console.log(`✓ Klient: ${hansUser.name}`);

  // ── Matches ────────────────────────────────────────────────
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Match 1: Marta ↔ Elisabeth — ACTIVE
  const existingMatch1 = await prisma.match.findFirst({
    where: { caregiverProfileId: martaProfile.id, clientProfileId: elisabethProfile.id },
  });
  if (!existingMatch1) {
    await prisma.match.create({
      data: {
        tenantId: tenant.id,
        caregiverProfileId: martaProfile.id,
        clientProfileId: elisabethProfile.id,
        status: MatchStatus.ACTIVE,
        score: 88,
        startDate: twoWeeksAgo,
        notes: "Sehr gute Chemie zwischen Pflegekraft und Klientin. Kroatische Sprachkenntnisse sehr hilfreich.",
        provisionAmount: 320.0,
        provisionStatus: "PENDING",
      },
    });
    console.log(`✓ Match: Marta ↔ Elisabeth (ACTIVE)`);
  }

  // Match 2: Stefan ↔ Hans — PROPOSED
  const existingMatch2 = await prisma.match.findFirst({
    where: { caregiverProfileId: stefanProfile.id, clientProfileId: hansProfile.id },
  });
  if (!existingMatch2) {
    await prisma.match.create({
      data: {
        tenantId: tenant.id,
        caregiverProfileId: stefanProfile.id,
        clientProfileId: hansProfile.id,
        status: MatchStatus.PROPOSED,
        score: 72,
        notes: "Erfahrung mit Demenzpatienten vorhanden. Terminabstimmung läuft.",
        provisionStatus: "PENDING",
      },
    });
    console.log(`✓ Match: Stefan ↔ Hans (PROPOSED)`);
  }

  // Match 3: Marta ↔ Hans — COMPLETED
  const existingMatch3 = await prisma.match.findFirst({
    where: {
      caregiverProfileId: martaProfile.id,
      clientProfileId: hansProfile.id,
      status: MatchStatus.COMPLETED,
    },
  });
  if (!existingMatch3) {
    await prisma.match.create({
      data: {
        tenantId: tenant.id,
        caregiverProfileId: martaProfile.id,
        clientProfileId: hansProfile.id,
        status: MatchStatus.COMPLETED,
        score: 91,
        startDate: threeMonthsAgo,
        endDate: oneMonthAgo,
        notes: "Vertretungseinsatz erfolgreich abgeschlossen.",
        provisionAmount: 480.0,
        provisionStatus: "PAID",
      },
    });
    console.log(`✓ Match: Marta ↔ Hans (COMPLETED)`);
  }

  // ── MatchRequests (Platform Leads) ────────────────────────
  const existingReq1 = await prisma.matchRequest.findFirst({
    where: { contactEmail: "familie.bauer@example.at" },
  });
  if (!existingReq1) {
    await prisma.matchRequest.create({
      data: {
        tenantId: platformTenant.id,
        contactName: "Familie Bauer",
        contactEmail: "familie.bauer@example.at",
        contactPhone: "+43 664 1234567",
        pflegegeldStufe: "STUFE_2",
        notes: "24h-Pflege für Mutter (78), sofort benötigt. Zimmer vorhanden.",
        careNeedsRaw: JSON.stringify({
          fuerWen: "elternteil",
          betreuungsart: "24h",
          pflegestufe: "stufe_2",
          mobilitaet: "mit_hilfe",
          demenz: "nein",
          unterkunft: "ja",
          startZeit: "sofort",
          dauer: "dauerhaft",
          sprachen: [{ lang: "Deutsch", level: "muttersprache" }],
          ort: "Wien 1190",
          name: "Familie Bauer",
          email: "familie.bauer@example.at",
          telefon: "+43 664 1234567",
        }),
        isProcessed: false,
      },
    });
    console.log(`✓ MatchRequest: Familie Bauer`);
  }

  const existingReq2 = await prisma.matchRequest.findFirst({
    where: { contactEmail: "karl.schwarz@example.at" },
  });
  if (!existingReq2) {
    await prisma.matchRequest.create({
      data: {
        tenantId: platformTenant.id,
        contactName: "Karl Schwarz",
        contactEmail: "karl.schwarz@example.at",
        contactPhone: "+43 316 987654",
        pflegegeldStufe: "STUFE_1",
        notes: "Stundenweise Betreuung, in ca. 1 Monat. Für Vater (82) in Graz.",
        careNeedsRaw: JSON.stringify({
          fuerWen: "elternteil",
          betreuungsart: "stundenweise",
          pflegestufe: "stufe_1",
          mobilitaet: "selbstaendig",
          demenz: "leicht",
          unterkunft: "nein",
          startZeit: "ein_monat",
          dauer: "monate",
          sprachen: [{ lang: "Deutsch", level: "muttersprache" }],
          ort: "Graz 8010",
          name: "Karl Schwarz",
          email: "karl.schwarz@example.at",
          telefon: "+43 316 987654",
        }),
        isProcessed: false,
      },
    });
    console.log(`✓ MatchRequest: Karl Schwarz`);
  }

  console.log("\n✅ Seed completed.");
  console.log(`\nLogin credentials:`);
  console.log(`  Superadmin:  ${superadminEmail} / ${superadminPassword}`);
  console.log(`  Vermittler:  ${vermittlerEmail} / ${vermittlerPassword}`);
  console.log(`  Pfleger:     marta.kovac@demo-pflegedienst.at / Pfleger1234!`);
  console.log(`  Pfleger:     stefan.huber@demo-pflegedienst.at / Pfleger1234!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
