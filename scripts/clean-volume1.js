/**
 * Script de nettoyage Volume 1 Endobiogénie
 *
 * RÈGLES STRICTES:
 * - Ne résume RIEN
 * - Ne modifie AUCUN mot du contenu médical
 * - Ne supprime AUCUNE ligne de contenu médical
 * - Ne reformule RIEN
 *
 * ACTIONS AUTORISÉES:
 * 1. Corriger les encodages cassés UTF-8
 * 2. Supprimer: pages de garde, sommaire, index, 4ème couverture
 * 3. Supprimer lignes vides multiples (garder 1 seule)
 * 4. Supprimer numéros de page isolés
 */

const fs = require('fs');
const path = require('path');

// Fichier source et destination
const SOURCE = path.join(__dirname, '../RAG/endobiogénie/volume1_clean.md');
const DEST = path.join(__dirname, '../RAG/endobiogénie/volume1_final.md');

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
  'Â': '',  // Caractère parasite
};

function fixEncoding(text) {
  let result = text;
  for (const [broken, fixed] of Object.entries(ENCODING_FIXES)) {
    result = result.split(broken).join(fixed);
  }
  return result;
}

function isPageNumber(line) {
  // Numéro de page isolé: juste un nombre seul sur une ligne
  const trimmed = line.trim();
  return /^\d{1,3}$/.test(trimmed);
}

function isSommaireLine(line) {
  // Lignes typiques du sommaire avec numéros de page
  const trimmed = line.trim();
  // Patterns comme "Introduction 1" ou "Chapitre 5 45" à la fin d'une ligne de sommaire
  return /\s+\d{1,3}$/.test(trimmed) && trimmed.length < 80 && !trimmed.startsWith('#');
}

function cleanVolume1() {
  console.log('=== NETTOYAGE VOLUME 1 ENDOBIOGÉNIE ===\n');

  // Lire le fichier source
  const content = fs.readFileSync(SOURCE, 'utf-8');
  const lines = content.split('\n');
  console.log(`Fichier source: ${lines.length} lignes`);

  // Sections à supprimer (basées sur l'analyse du fichier)
  const SKIP_START = 0;      // Début du fichier
  const SKIP_END_INTRO = 651; // Fin des pages de garde + sommaire
  const INDEX_START = 22874;  // Début de l'index alphabétique (juste avant "Index")

  const cleanedLines = [];
  let consecutiveEmpty = 0;
  let inSommaire = false;
  let skippedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // === SECTION 1: Supprimer pages de garde et sommaire (lignes 1-651) ===
    if (i < SKIP_END_INTRO) {
      skippedLines++;
      continue;
    }

    // === SECTION 2: Supprimer tout après INDEX_START (index + 4ème couverture) ===
    if (i >= INDEX_START) {
      skippedLines++;
      continue;
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
        continue; // Garder seulement 1 ligne vide
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
  console.log(`Lignes finales: ${cleanedLines.length}`);
  console.log(`\nFichier créé: ${DEST}`);

  // Vérifications
  const finalSize = fs.statSync(DEST).size;
  console.log(`Taille finale: ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
}

cleanVolume1();
