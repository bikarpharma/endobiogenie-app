const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const synthese = await prisma.unifiedSynthesis.findFirst({
      where: { patientId: 'cmiftvujn0000s65g4pqt2ueo' },
      orderBy: { createdAt: 'desc' },
    });

    if (!synthese) {
      console.log('Pas de synthèse trouvée');
      return;
    }

    console.log('=== SYNTHÈSE ===');
    console.log('Date:', synthese.createdAt);
    console.log('Confiance:', synthese.confiance);

    const content = synthese.content;
    const sp = content?.suggestedPrescription;

    if (sp) {
      console.log('\n=== suggestedPrescription ===');
      console.log('phytotherapie:', sp.phytotherapie?.length || 0, 'items');
      console.log('gemmotherapie:', sp.gemmotherapie?.length || 0, 'items');
      console.log('aromatherapie:', sp.aromatherapie?.length || 0, 'items');
      console.log('phaseDrainage:', sp.phaseDrainage ? 'OUI' : 'NON');
      console.log('oligoElements:', sp.oligoElements?.length || 0, 'items');

      if (sp.phytotherapie && sp.phytotherapie.length > 0) {
        console.log('\n--- Phyto sample ---');
        console.log(JSON.stringify(sp.phytotherapie[0], null, 2));
      }

      if (sp.gemmotherapie && sp.gemmotherapie.length > 0) {
        console.log('\n--- Gemmo sample ---');
        console.log(JSON.stringify(sp.gemmotherapie[0], null, 2));
      }
    } else {
      console.log('Pas de suggestedPrescription');
      console.log('Keys disponibles:', Object.keys(content || {}));
    }

    // Vérifier la dernière ordonnance
    const ordonnance = await prisma.ordonnance.findFirst({
      where: { patientId: 'cmiftvujn0000s65g4pqt2ueo' },
      orderBy: { createdAt: 'desc' },
    });

    if (ordonnance) {
      console.log('\n=== DERNIÈRE ORDONNANCE ===');
      console.log('Date:', ordonnance.createdAt);
      console.log('voletEndobiogenique:', Array.isArray(ordonnance.voletEndobiogenique) ? ordonnance.voletEndobiogenique.length : 'non-array');
      console.log('voletPhytoElargi:', Array.isArray(ordonnance.voletPhytoElargi) ? ordonnance.voletPhytoElargi.length : 'non-array');
      console.log('voletComplements:', Array.isArray(ordonnance.voletComplements) ? ordonnance.voletComplements.length : 'non-array');
    }

  } finally {
    await prisma.$disconnect();
  }
}

check().catch(console.error);
