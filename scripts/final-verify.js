/**
 * Script de vérification finale TUNISIA_DB vs Excel
 * Vérifie que chaque entrée a les bonnes formes
 */

const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(process.cwd(), 'docs/plantes_extraits_complet.xlsx'));
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Build Excel reference map
const excelRef = new Map();

data.slice(1).filter(row => row[0] && row[1]).forEach((row, i) => {
  const nomFr = (row[0] || '').toString().trim().toUpperCase();
  const nomLatin = (row[1] || '').toString().trim();
  const hasHE = row[2] ? true : false;
  const hasMicro = row[3] ? true : false;
  const hasMG = row[4] ? true : false;
  const hasEPS = row[5] ? true : false;
  const hasEPF = row[6] ? true : false;

  const formes = [];
  if (hasHE) formes.push('HE');
  if (hasMicro) formes.push('MICROSPHERES');
  if (hasMG) formes.push('MACERAT_CONCENTRE');
  if (hasEPS) formes.push('EPS');
  if (hasEPF) formes.push('EPF');

  if (formes.length > 0) {
    excelRef.set(nomFr, { nomLatin, formes, ligne: i + 2 });
  }
});

// Plants to verify (common ones that might have errors)
const plantsToVerify = [
  'CURCUMA LONGA',
  'ROMARIN',
  'THYM',
  'ARTICHAUT',
  'LAVANDE',
  'EUCALYPTUS GLOBULEUX',
  'GINGEMBRE',
  'CASSIS',
  'AUBEPINE',
  'VALÉRIANE',
  'PASSIFLORE',
  'MILLEPERTUIS',
  'ECHINACEE',
  'GINKGO BILOBA',
  'CHARDON MARIE',
  'DESMODIUM',
  'PISSENLIT',
  'BARDANE',
  'ORTHOSIPHON',
  'PILOSELLE',
];

console.log('═'.repeat(70));
console.log('  VÉRIFICATION DES PLANTES COURANTES');
console.log('═'.repeat(70));

plantsToVerify.forEach(name => {
  const entry = excelRef.get(name);
  if (entry) {
    console.log(`\n${name}:`);
    console.log(`  Latin: ${entry.nomLatin}`);
    console.log(`  Formes: [${entry.formes.join(', ')}]`);
    console.log(`  Ligne Excel: ${entry.ligne}`);
  } else {
    console.log(`\n${name}: ⚠️ NON TROUVÉ`);
  }
});

// Check for any plant with HE + MICROSPHERES (potential issues)
console.log('\n');
console.log('═'.repeat(70));
console.log('  PLANTES AVEC HE ET MICROSPHERES (à vérifier)');
console.log('═'.repeat(70));

excelRef.forEach((entry, name) => {
  if (entry.formes.includes('HE') && entry.formes.includes('MICROSPHERES')) {
    console.log(`\n${name} (${entry.nomLatin}):`);
    console.log(`  Formes: [${entry.formes.join(', ')}]`);
  }
});
