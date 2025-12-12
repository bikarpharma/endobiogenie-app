// Test RAG Gemmothérapie
import ragLocal, { searchGemmoByAxes, parseGemmoMonographie } from '../lib/ordonnance/ragLocalSearch';

async function main() {
  console.log('=== TEST RAG GEMMOTHÉRAPIE ===\n');

  // Stats
  console.log('📊 Stats RAG:');
  console.log('   Gemmothérapie:', ragLocal.gemmotherapie?.bourgeons?.length || 0, 'bourgeons');
  console.log('');

  // Simuler des axes perturbés
  const axes = [
    { axe: 'corticotrope', niveau: 'hyper' as const, score: 7, justification: 'Test cortisol' },
    { axe: 'sna_alpha', niveau: 'hyper' as const, score: 6, justification: 'Test SNA' }
  ];

  console.log('🔍 Recherche pour axes:', axes.map(a => a.axe).join(', '));
  console.log('');

  const results = searchGemmoByAxes(axes, {
    maxResults: 5,
    excludeCI: []
  });

  console.log('✅ Bourgeons trouvés:', results.length);
  console.log('');

  for (const r of results) {
    console.log('🌿', r.bourgeon.nom_latin);
    console.log('   Nom:', r.bourgeon.nom);
    console.log('   Axe cible:', r.axeCible);
    console.log('   Props matchées:', r.matchedProps.slice(0, 4).join(', '));
    console.log('   Score:', r.score.toFixed(1));

    // Parser la monographie
    const parsed = parseGemmoMonographie(r.bourgeon);
    console.log('   Propriétés:', parsed.proprietes.join(', ') || '-');
    console.log('   Tropisme:', parsed.tropisme.join(', ') || '-');
    console.log('');
  }
}

main().catch(console.error);
