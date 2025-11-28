// Vérifier si le RAG a été utilisé dans la dernière synthèse
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const synthese = await prisma.unifiedSynthesis.findFirst({
      where: { patientId: 'cmiftvujn0000s65g4pqt2ueo' },
      orderBy: { createdAt: 'desc' },
    });

    if (!synthese) {
      console.log('Pas de synthèse');
      return;
    }

    const content = synthese.content;
    const meta = content?.meta;

    console.log('=== MÉTADONNÉES SYNTHÈSE ===');
    console.log('Date:', synthese.createdAt);
    console.log('Model:', meta?.modelUsed || 'N/A');
    console.log('Processing time:', meta?.processingTime || 'N/A', 'ms');
    console.log('');
    console.log('=== RAG UTILISÉ ? ===');
    console.log('ragUsed:', meta?.ragUsed || false);
    console.log('ragSources:', JSON.stringify(meta?.ragSources || null, null, 2));

    if (!meta?.ragUsed) {
      console.log('\n⚠️  LE RAG N\'A PAS ÉTÉ UTILISÉ!');
      console.log('Possible causes:');
      console.log('  - Erreur silencieuse dans searchAllVectorstores()');
      console.log('  - Le catch a intercepté une erreur');
    } else {
      console.log('\n✅ LE RAG A ÉTÉ UTILISÉ!');
    }

  } finally {
    await prisma.$disconnect();
  }
}

check().catch(console.error);
