/**
 * Setzt das Passwort des Superadmins über ENV-Variablen.
 *
 * Verwendung (direkt im Docker-Container):
 *   docker exec -it <container> \
 *     -e ADMIN_EMAIL=admin@pflegematch.at \
 *     -e ADMIN_PASSWORD=... \
 *     node scripts/set-admin-password.js
 */

const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

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
