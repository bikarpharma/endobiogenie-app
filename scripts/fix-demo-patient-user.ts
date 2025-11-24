// Script pour associer le patient DEMO-001 à l'utilisateur connecté
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Recherche du patient DEMO-001...');

  const demoPatient = await prisma.patient.findUnique({
    where: { numeroPatient: 'DEMO-001' },
  });

  if (!demoPatient) {
    console.log('❌ Patient DEMO-001 introuvable');
    return;
  }

  console.log(`✅ Patient trouvé: ${demoPatient.prenom} ${demoPatient.nom}`);
  console.log(`   User ID actuel: ${demoPatient.userId}`);

  // Trouver le premier utilisateur réel (non démo)
  const realUser = await prisma.user.findFirst({
    where: {
      email: {
        not: 'demo@endobiogenie.fr'
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  if (!realUser) {
    console.log('❌ Aucun utilisateur réel trouvé');
    return;
  }

  console.log(`📧 Utilisateur cible: ${realUser.email}`);

  // Mise à jour du patient
  const updated = await prisma.patient.update({
    where: { id: demoPatient.id },
    data: { userId: realUser.id },
  });

  console.log(`✅ Patient DEMO-001 maintenant associé à: ${realUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
