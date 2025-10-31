// Script pour supprimer le patient de test
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Suppression du patient de test...\n');

  // Supprimer le patient de test (TEST-001)
  const result = await prisma.patient.deleteMany({
    where: {
      numeroPatient: 'TEST-001'
    }
  });

  if (result.count > 0) {
    console.log(`✅ ${result.count} patient(s) de test supprimé(s)`);
    console.log('\n💡 Relancez maintenant: node scripts/add-test-patient.js\n');
  } else {
    console.log('ℹ️  Aucun patient de test trouvé (TEST-001)\n');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
