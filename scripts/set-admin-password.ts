/**
 * Setzt das Passwort des Superadmins über ENV-Variablen.
 * Niemals Credentials im Code – alles kommt aus der Umgebung.
 *
 * Verwendung:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/set-admin-password.ts
 *
 * Oder mit .env.production:
 *   npx dotenv -e .env.production -- tsx scripts/set-admin-password.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL und ADMIN_PASSWORD müssen gesetzt sein.");
    process.exit(1);
  }

  if (password.length < 16) {
    console.error("❌ Passwort muss mindestens 16 Zeichen haben.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ Kein User mit E-Mail "${email}" gefunden.`);
    process.exit(1);
  }

  if (user.role !== "SUPERADMIN") {
    console.error(`❌ User "${email}" ist kein SUPERADMIN (Rolle: ${user.role}).`);
    process.exit(1);
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  console.log(`✓ Passwort für "${email}" erfolgreich aktualisiert.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
