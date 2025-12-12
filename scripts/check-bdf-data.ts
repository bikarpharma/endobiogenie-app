import { prisma } from '../lib/prisma';

async function main() {
  // Récupérer la dernière analyse BdF
  const lastBdf = await prisma.bdfAnalysis.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { patient: { select: { nom: true, prenom: true } } }
  });

  if (!lastBdf) {
    console.log('Aucune analyse BdF trouvée');
    return;
  }

  console.log('=== Dernière analyse BdF ===');
  console.log('Patient:', lastBdf.patient.prenom, lastBdf.patient.nom);
  console.log('Date:', lastBdf.date);
  console.log('');

  console.log('=== INPUTS (biomarqueurs saisis) ===');
  console.log(JSON.stringify(lastBdf.inputs, null, 2));
  console.log('');

  console.log('=== INDEXES (structure complète) ===');
  const indexes = lastBdf.indexes as Record<string, any>;
  console.log('Type de indexes:', typeof indexes);
  console.log('Clés présentes:', Object.keys(indexes).slice(0, 10));
  console.log('');

  console.log('=== idx_thyroidien (détail) ===');
  console.log('Valeur brute:', indexes.idx_thyroidien);
  console.log('Type:', typeof indexes.idx_thyroidien);

  if (indexes.idx_thyroidien) {
    console.log('.value:', indexes.idx_thyroidien.value);
    console.log('.status:', indexes.idx_thyroidien.status);
  }

  console.log('');
  console.log('=== PREMIERS 3 INDEX ===');
  Object.entries(indexes).slice(0, 3).forEach(([key, val]) => {
    console.log(`${key}:`, JSON.stringify(val));
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
