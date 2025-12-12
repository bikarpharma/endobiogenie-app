const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Recherche des utilisateurs...');

  // Lister tous les utilisateurs
  const users = await prisma.user.findMany({
    select: { id: true, email: true }
  });
  console.log('Utilisateurs:', users);

  // Trouver votre compte
  const user = users.find(u => u.email === 'amine.benayed@live.fr');

  if (!user) {
    console.log('❌ Utilisateur amine.benayed@live.fr non trouvé');
    return;
  }

  console.log('✅ Votre compte:', user.id);

  // Trouver la patiente BENZARTI
  const patient = await prisma.patient.findFirst({
    where: { nom: 'BENZARTI', prenom: 'Sonia' }
  });

  if (patient) {
    console.log('📋 Patiente trouvée:', patient.numeroPatient);
    console.log('   Propriétaire actuel:', patient.userId);

    // Transférer vers votre compte
    await prisma.patient.update({
      where: { id: patient.id },
      data: { userId: user.id }
    });
    console.log('✅ Patiente BENZARTI transférée vers votre compte!');
  } else {
    console.log('❌ Patiente BENZARTI non trouvée, création...');
    // Recréer avec le bon userId
  }
}

main()
  .catch(e => console.error('Erreur:', e))
  .finally(() => prisma.$disconnect());
