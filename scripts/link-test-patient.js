const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Trouver le patient test
  const patient = await prisma.patient.findFirst({
    where: { nom: 'TEST_MOTEUR_01' }
  });

  console.log('Patient:', patient ? patient.numeroPatient : 'NON TROUVE');
  console.log('userId actuel:', patient?.userId || 'AUCUN');

  // Trouver votre compte
  const user = await prisma.user.findFirst({
    where: { email: 'amine.benayed@live.fr' }
  });

  console.log('User:', user?.email || 'NON TROUVE');
  console.log('User ID:', user?.id || 'N/A');

  if (patient && user) {
    const updated = await prisma.patient.update({
      where: { id: patient.id },
      data: { userId: user.id }
    });
    console.log('\n✅ LIEN CRÉÉ!');
    console.log('Patient', updated.numeroPatient, 'maintenant visible dans votre liste');
  }
}

main()
  .catch(e => console.error('Erreur:', e))
  .finally(() => prisma.$disconnect());
