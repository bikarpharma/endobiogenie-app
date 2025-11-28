/**
 * Script de nettoyage Volume 4 Endobiogénie (EN) - Bedside Handbook
 *
 * RÈGLES STRICTES:
 * - Ne résume RIEN
 * - Ne modifie AUCUN mot du contenu médical
 * - Ne supprime AUCUNE ligne de contenu médical
 * - Ne reformule RIEN
 *
 * ACTIONS AUTORISÉES:
 * 1. Corriger les encodages cassés UTF-8
 * 2. Supprimer: pages de garde, sommaire, index alphabétique, 4ème couverture
 * 3. Supprimer lignes vides multiples (garder 1 seule)
 * 4. Supprimer numéros de page isolés
 * 5. Supprimer watermarks
 */

const fs = require('fs');
const path = require('path');

// Fichier source et destination
const SOURCE = path.join(__dirname, '../RAG/endobiogénie/The Theory of Endobiogeny_ Volu4 - Kamyar M. Hedayat4.txt');
const DEST = path.join(__dirname, '../RAG/endobiogénie/volume4_final.md');

// Table de correction des encodages cassés
const ENCODING_FIXES = {
  'Ã©': 'é',
  'Ã ': 'à',
  'Ã¨': 'è',
  'Ã´': 'ô',
  'Ã¹': 'ù',
  'Ã®': 'î',
  'Ã¯': 'ï',
  'Ã§': 'ç',
  'Ãª': 'ê',
  'Ã«': 'ë',
  'â€™': "'",
  'â€œ': '"',
  'â€': '"',
  'â€"': '–',
  'â€¢': '•',
  'Å"': 'œ',
  'Ã': 'À',
  'Ã¢': 'â',
  'Ã»': 'û',
  'Ã¼': 'ü',
  'Â': '',
};

// Watermarks à supprimer
const WATERMARK_PATTERNS = [
  /This book belongs to amine benayed/i,
  /amine\.benayed@live\.fr/i,
  /Copyright Elsevier/i,
  /This page intentionally left blank/i,
];

function fixEncoding(text) {
  let result = text;
  for (const [broken, fixed] of Object.entries(ENCODING_FIXES)) {
    result = result.split(broken).join(fixed);
  }
  return result;
}

function isPageNumber(line) {
  const trimmed = line.trim();
  return /^\d{1,3}$/.test(trimmed);
}

function isWatermark(line) {
  return WATERMARK_PATTERNS.some(pattern => pattern.test(line));
}

function cleanVolume4() {
  console.log('=== NETTOYAGE VOLUME 4 ENDOBIOGÉNIE (EN) - Bedside Handbook ===\n');

  // Lire le fichier source
  const content = fs.readFileSync(SOURCE, 'utf-8');
  const lines = content.split('\n');
  console.log(`Fichier source: ${lines.length} lignes`);

  // Sections à supprimer (basées sur l'analyse du fichier)
  const SKIP_END_INTRO = 800;   // Fin des pages de garde + sommaire (avant "Theory and foundation")
  const INDEX_START = 13547;    // Avant "Index"

  const cleanedLines = [];
  let consecutiveEmpty = 0;
  let skippedLines = 0;
  let watermarksRemoved = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // === SECTION 1: Supprimer pages de garde et sommaire ===
    if (i < SKIP_END_INTRO) {
      skippedLines++;
      continue;
    }

    // === SECTION 2: Supprimer index alphabétique et 4ème couverture ===
    if (i >= INDEX_START) {
      skippedLines++;
      continue;
    }

    // === SUPPRIMER WATERMARKS ===
    if (isWatermark(line)) {
      watermarksRemoved++;
      line = '';
    }

    // === CORRECTIONS D'ENCODAGE ===
    line = fixEncoding(line);

    // === SUPPRIMER NUMÉROS DE PAGE ISOLÉS ===
    if (isPageNumber(line)) {
      skippedLines++;
      continue;
    }

    // === GÉRER LIGNES VIDES MULTIPLES ===
    if (line.trim() === '') {
      consecutiveEmpty++;
      if (consecutiveEmpty > 1) {
        skippedLines++;
        continue;
      }
    } else {
      consecutiveEmpty = 0;
    }

    cleanedLines.push(line);
  }

  // Écrire le fichier nettoyé
  const cleanedContent = cleanedLines.join('\n');
  fs.writeFileSync(DEST, cleanedContent, 'utf-8');

  console.log(`\n=== RÉSULTAT ===`);
  console.log(`Lignes originales: ${lines.length}`);
  console.log(`Lignes supprimées: ${skippedLines}`);
  console.log(`Watermarks supprimés: ${watermarksRemoved}`);
  console.log(`Lignes finales: ${cleanedLines.length}`);
  console.log(`\nFichier créé: ${DEST}`);

  const finalSize = fs.statSync(DEST).size;
  console.log(`Taille finale: ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
}

cleanVolume4();
