import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Recherche des patients TEST...\n");

  const patients = await prisma.patient.findMany({
    where: {
      numeroPatient: {
        startsWith: "TEST"
      }
    },
    select: {
      id: true,
      numeroPatient: true,
      nom: true,
      prenom: true,
      userId: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });

  if (patients.length === 0) {
    console.log("❌ Aucun patient TEST trouvé dans la base");

    // Vérifier l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: "amine.benayed@live.fr" }
    });

    if (user) {
      console.log(`\n✅ Utilisateur trouvé: ${user.id}`);

      const allPatients = await prisma.patient.findMany({
        where: { userId: user.id },
        select: { numeroPatient: true, nom: true, prenom: true }
      });

      console.log(`\n📋 Patients de cet utilisateur (${allPatients.length}):`);
      allPatients.forEach(p => console.log(`  - ${p.numeroPatient}: ${p.prenom} ${p.nom}`));
    } else {
      console.log("❌ Utilisateur amine.benayed@live.fr non trouvé");
    }
  } else {
    console.log(`✅ ${patients.length} patients TEST trouvés:\n`);
    patients.forEach(p => {
      console.log(`  - ${p.numeroPatient}: ${p.prenom} ${p.nom}`);
      console.log(`    userId: ${p.userId}`);
      console.log(`    email: ${p.user?.email}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
