// Script pour supprimer les anciennes synthèses et forcer la régénération avec RAG
// Usage: node scripts/reset-synthesis.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetSynthesis() {
  const patientId = 'cmiftvujn0000s65g4pqt2ueo';

  console.log('=== RESET SYNTHÈSE POUR FORCER RAG ===\n');

  try {
    // 1. Voir les synthèses existantes
    const syntheses = await prisma.unifiedSynthesis.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`Synthèses existantes: ${syntheses.length}`);
    syntheses.forEach(s => {
      console.log(`  - ${s.id} | ${s.createdAt} | confiance: ${s.confiance}`);
    });

    // 2. Supprimer toutes les synthèses pour ce patient
    const deleted = await prisma.unifiedSynthesis.deleteMany({
      where: { patientId },
    });

    console.log(`\n✅ ${deleted.count} synthèse(s) supprimée(s)`);
    console.log('\n👉 La prochaine génération d\'ordonnance utilisera le RAG!');

  } finally {
    await prisma.$disconnect();
  }
}

resetSynthesis().catch(console.error);
