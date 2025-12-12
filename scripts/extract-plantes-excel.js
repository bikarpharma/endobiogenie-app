/**
 * Script pour extraire les plantes depuis plantes_extraits_complet.xlsx
 * et générer le code pour TUNISIA_DB
 */

const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(process.cwd(), 'docs/plantes_extraits_complet.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Générer le code pour TUNISIA_DB
console.log('// ========================================');
console.log('// TUNISIA_DB - Généré depuis plantes_extraits_complet.xlsx');
console.log('// Total: ' + (data.length - 1) + ' plantes');
console.log('// ========================================');
console.log('');
console.log('const TUNISIA_DB = new Map<string, TunisiaPlantProfile>([');

data.slice(1).forEach((row, i) => {
  const nomFr = row[0] || '';
  const nomLatin = row[1] || '';
  const hasHE = row[2] ? true : false;
  const hasMicro = row[3] ? true : false;
  const hasMG = row[4] ? true : false;
  const hasEPS = row[5] ? true : false;
  const hasEPF = row[6] ? true : false;

  if (!nomLatin) return;

  // Créer l'ID (nom latin en snake_case)
  const id = nomLatin
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]+/g, '_')
    .replace(/^_|_$/g, '');

  // Construire les formes disponibles
  const formes = [];
  if (hasHE) formes.push("'HE'");
  if (hasMicro) formes.push("'MICROSPHERES'");
  if (hasMG) formes.push("'MACERAT_CONCENTRE'");
  if (hasEPS) formes.push("'EPS'");
  if (hasEPF) formes.push("'EPF'");

  if (formes.length === 0) return;

  const formesStr = formes.join(', ');
  const nomFrEscaped = nomFr.replace(/'/g, "\\'");
  const nomLatinEscaped = nomLatin.replace(/'/g, "\\'");

  console.log(`  ['${id}', { nom_fr: '${nomFrEscaped}', nom_latin: '${nomLatinEscaped}', formes_dispo: [${formesStr}] }],`);
});

console.log(']);');
