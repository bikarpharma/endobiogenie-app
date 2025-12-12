/**
 * Script de vérification complète de TUNISIA_DB contre l'Excel source
 * Usage: node scripts/verify-tunisia-db.js
 */

const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(process.cwd(), 'docs/plantes_extraits_complet.xlsx'));
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Skip header
const plants = data.slice(1).filter(row => row[0] && row[1]);

console.log('═'.repeat(70));
console.log('  VÉRIFICATION COMPLÈTE DES PLANTES EXCEL');
console.log('═'.repeat(70));
console.log('Total plantes dans Excel:', plants.length);
console.log('');

// Group by nom_latin to find duplicates
const latinGroups = new Map();

plants.forEach((row, i) => {
  const nomFr = (row[0] || '').toString().trim();
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

  if (formes.length === 0) return;

  const latinKey = nomLatin.toLowerCase();

  if (!latinGroups.has(latinKey)) {
    latinGroups.set(latinKey, []);
  }
  latinGroups.get(latinKey).push({
    nomFr,
    nomLatin,
    formes,
    ligne: i + 2
  });
});

console.log('');
console.log('═'.repeat(70));
console.log('  PLANTES AVEC NOM LATIN IDENTIQUE (DOUBLONS À TRAITER SÉPARÉMENT)');
console.log('═'.repeat(70));

let doublons = 0;
latinGroups.forEach((entries, latin) => {
  if (entries.length > 1) {
    doublons++;
    console.log('');
    console.log(`${doublons}. ${latin.toUpperCase()}`);
    entries.forEach(e => {
      console.log(`   Ligne ${e.ligne}: "${e.nomFr}" → [${e.formes.join(', ')}]`);
    });
  }
});

console.log('');
console.log('═'.repeat(70));
console.log(`  TOTAL DOUBLONS: ${doublons} noms latins avec plusieurs entrées`);
console.log('═'.repeat(70));

// Generate correct TypeScript code for all entries
console.log('');
console.log('═'.repeat(70));
console.log('  CODE TYPESCRIPT CORRIGÉ POUR LES DOUBLONS');
console.log('═'.repeat(70));

latinGroups.forEach((entries, latin) => {
  if (entries.length > 1) {
    entries.forEach(e => {
      // Create unique ID based on nom_fr for duplicates
      const id = e.nomFr
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z]+/g, '_')
        .replace(/^_|_$/g, '');

      const formesStr = e.formes.map(f => `'${f}'`).join(', ');
      const nomFrEscaped = e.nomFr.replace(/'/g, "\\'");
      const nomLatinEscaped = e.nomLatin.replace(/'/g, "\\'");

      console.log(`  ['${id}', { nom_fr: '${nomFrEscaped}', nom_latin: '${nomLatinEscaped}', formes_dispo: [${formesStr}] }],`);
    });
  }
});
