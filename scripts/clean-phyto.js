/**
 * Script de nettoyage du Grand Manuel de Phytothérapie - Eric Lorrain
 *
 * Ce script :
 * 1. Extrait les 100 monographies de plantes (Partie 2)
 * 2. Nettoie les lignes vides excessives (artefact de conversion PDF)
 * 3. Génère un fichier JSON structuré par plante pour l'ingestion RAG
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../RAG/phyto/Grand Manuel de phytotherapie - Eric Lorrain.txt');
const OUTPUT_DIR = path.join(__dirname, '../RAG/phyto/plantes');
const OUTPUT_JSON = path.join(__dirname, '../RAG/phyto/phytotherapie-monographies.json');

// Liste des 100 plantes avec leur numéro et nom
const PLANTES_PATTERN = /^(\d+)\s+(L'|Le\s|La\s)([A-Za-zÀ-ÿ\s\-'()]+)$/;

// Pattern pour détecter le début d'une monographie (numéro + article + nom)
const MONOGRAPHIE_START_PATTERN = /^(\d{1,3})\s+(L'|Le\s|La\s)/;

function cleanText(text) {
  // Étape 1: Supprimer les retours chariot Windows et normaliser
  text = text.replace(/\r/g, '');

  // Étape 2: Supprimer TOUTES les lignes vides (artefact PDF où une ligne sur deux est vide)
  let lines = text.split('\n').filter(line => line.trim() !== '');

  // Étape 3: Fusionner les lignes qui sont des continuations de phrases
  let merged = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Détecter si c'est un début de section ou un nouveau paragraphe
    const isNewSection =
      line.match(/^(Dénomination|Autres|Noms anglais|Noms allemands|Famille botanique|Partie utilisée|Description botanique|Composition chimique|Propriétés|Usages|Indications|Posologies|Effets|Précautions|Contre-indications|Interactions|Bibliographie|●|–|−|\d+\.|^\d+\s+L)/i) ||
      line.match(/^[A-Z][a-z]+\s+(et|ou)\s+[a-z]/);

    // Détecter si la ligne précédente se terminait proprement
    const prevLine = merged.length > 0 ? merged[merged.length - 1] : '';
    const prevEndsComplete = prevLine.match(/[.;:!?»"]$/) || prevLine === '';

    // Fusionner si ce n'est pas une nouvelle section et que la ligne précédente ne se termine pas
    if (merged.length > 0 && !isNewSection && !prevEndsComplete && !line.match(/^[A-Z]{2,}/) && !line.match(/^[0-9]+\./)) {
      merged[merged.length - 1] += ' ' + line;
    } else {
      merged.push(line);
    }
  }

  // Étape 4: Ajouter des sauts de ligne entre les sections principales
  let result = [];
  for (let i = 0; i < merged.length; i++) {
    const line = merged[i];

    // Ajouter une ligne vide avant les sections principales
    if (result.length > 0 && line.match(/^(Description botanique|Composition chimique|Propriétés pharmacologiques|Usages reconnus|Indications|Posologies|Effets indésirables|Précautions|Contre-indications|Interactions|Bibliographie)/i)) {
      result.push('');
    }

    result.push(line);
  }

  return result.join('\n');
}

function extractSection(text, sectionName) {
  const patterns = {
    'denomination_botanique': /Dénomination\s+(.+?)(?=\nbotanique|$)/is,
    'autres_denominations': /Autres\s+dénominations?\s+(.+?)(?=\nNoms anglais|$)/is,
    'noms_anglais': /Noms anglais\s+(.+?)(?=\nNoms allemands|$)/is,
    'noms_allemands': /Noms allemands?\s+(.+?)(?=\nFamille botanique|$)/is,
    'famille_botanique': /Famille botanique\s+(.+?)(?=\nPartie utilisée|$)/is,
    'partie_utilisee': /Partie utilisée en\s+médecine\s+(.+?)(?=\n\n|$)/is,
    'description_botanique': /Description botanique[^]*?(?=\n\nComposition chimique)/is,
    'composition_chimique': /Composition chimique[^]*?(?=\n\nPropriétés pharmacologiques)/is,
    'proprietes_pharmacologiques': /Propriétés pharmacologiques[^]*?(?=\n\nIndications|Usage clinique|Posologies)/is,
  };

  const pattern = patterns[sectionName];
  if (!pattern) return null;

  const match = text.match(pattern);
  return match ? match[1]?.trim() || match[0]?.trim() : null;
}

function parseMonographie(text, numero, nomComplet) {
  const cleaned = cleanText(text);

  // Extraire le nom latin (première ligne après le titre qui contient le nom)
  const latinMatch = cleaned.match(/Dénomination\s+([A-Z][a-z]+\s+[a-z]+(?:\s+[A-Z]\.)?)/);
  const nomLatin = latinMatch ? latinMatch[1] : '';

  // Extraire la famille botanique
  const familleMatch = cleaned.match(/Famille botanique\s+([A-Za-zéè]+(?:\s*\([^)]+\))?)/);
  const famille = familleMatch ? familleMatch[1] : '';

  // Extraire la partie utilisée
  const partieMatch = cleaned.match(/Partie utilisée en\s+médecine\s+([^\n]+)/);
  const partieUtilisee = partieMatch ? partieMatch[1].trim() : '';

  return {
    numero: parseInt(numero),
    nom_francais: nomComplet.trim(),
    nom_latin: nomLatin,
    famille_botanique: famille,
    partie_utilisee: partieUtilisee,
    contenu_complet: cleaned,
    source: 'Grand Manuel de Phytothérapie - Eric Lorrain (Dunod, 2024)'
  };
}

function main() {
  console.log('📚 Lecture du Grand Manuel de Phytothérapie...');

  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = content.split('\n');

  console.log(`   Total: ${lines.length} lignes`);

  // Trouver le début réel de la Partie 2 (chercher "100 plantes" suivi de la première monographie)
  let partie2Start = -1;
  let partie3Start = -1;

  for (let i = 0; i < lines.length; i++) {
    // Chercher "100 plantes" (le vrai contenu, pas le sommaire)
    if (lines[i].trim() === '100 plantes' && i > 20000) {
      partie2Start = i;
      console.log(`   Trouvé "100 plantes" à la ligne ${i}`);
    }
    // Chercher "Démarche clinique en" qui indique le début de la Partie 3
    if (lines[i].trim() === 'Démarche clinique en' && partie2Start > 0) {
      partie3Start = i;
      break;
    }
  }

  // Si on n'a pas trouvé la fin, chercher autrement
  if (partie3Start === -1) {
    for (let i = lines.length - 1; i > partie2Start; i--) {
      if (lines[i].trim() === 'PARTIE 3') {
        partie3Start = i;
        break;
      }
    }
  }

  // Fallback: utiliser une ligne connue
  if (partie2Start === -1) {
    // On sait que la première monographie est à la ligne 26351
    partie2Start = 26347;
  }
  if (partie3Start === -1) {
    // Chercher la fin approximative (Partie 3 ou Préambule de la partie clinique)
    for (let i = 270000; i < lines.length; i++) {
      if (lines[i].trim().match(/^Préambule$/) || lines[i].trim() === 'PARTIE 3') {
        partie3Start = i;
        break;
      }
    }
    if (partie3Start === -1) partie3Start = 280000; // Estimation
  }

  console.log(`   Partie 2 commence à la ligne ${partie2Start}`);
  console.log(`   Partie 3 commence à la ligne ${partie3Start}`);

  // Extraire les monographies entre Partie 2 et Partie 3
  const monographies = [];
  let currentContent = [];
  let currentNumero = null;
  let currentNom = null;

  // Chercher les monographies
  let inMonographies = false;

  for (let i = partie2Start; i < partie3Start; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Détecter le début d'une nouvelle monographie
    // Pattern: numéro + espace + article (L', Le, La, Les) + nom
    // Note: 8217 = ' (RIGHT SINGLE QUOTATION MARK), 39 = ' (APOSTROPHE)
    // Cas spéciaux: "Les sauges" (88), "0 La vigne rouge" (100), "12 L'aubépine" collé en fin de ligne
    let match = trimmed.match(/^(\d{1,3})\s+(L[\u2019\u0027]|Le\s|La\s|Les\s)(.+)$/);

    // Cas spécial: "12 L'aubépine" collé à la fin d'une autre ligne
    const aubepineMatch = trimmed.match(/12 L[\u2019\u0027]aubépine$/);
    if (aubepineMatch && !match) {
      match = ["12 L\u2019aubépine", "12", "L\u2019", "aubépine"];
    }

    // Cas spécial: "0 La vigne rouge" qui est en fait la monographie 100
    const isVigneRouge = trimmed === '0 La vigne rouge';

    if ((match && parseInt(match[1]) >= 1 && parseInt(match[1]) <= 100) || isVigneRouge) {
      // Sauvegarder la monographie précédente
      if (currentNumero !== null && currentContent.length > 0) {
        const monographie = parseMonographie(
          currentContent.join('\n'),
          currentNumero,
          currentNom
        );
        monographies.push(monographie);
        console.log(`   ✓ Monographie ${currentNumero}: ${currentNom}`);
      }

      // Nouvelle monographie
      if (isVigneRouge) {
        currentNumero = '100';
        currentNom = 'La vigne rouge';
      } else {
        currentNumero = match[1];
        currentNom = match[2] + match[3];
      }
      currentContent = [trimmed];
      inMonographies = true;
    } else if (inMonographies) {
      currentContent.push(line);
    }
  }

  // Sauvegarder la dernière monographie
  if (currentNumero !== null && currentContent.length > 0) {
    const monographie = parseMonographie(
      currentContent.join('\n'),
      currentNumero,
      currentNom
    );
    monographies.push(monographie);
    console.log(`   ✓ Monographie ${currentNumero}: ${currentNom}`);
  }

  console.log(`\n📊 Total: ${monographies.length} monographies extraites`);

  // Créer le dossier de sortie
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Sauvegarder chaque monographie en fichier individuel
  for (const mono of monographies) {
    const filename = `${String(mono.numero).padStart(2, '0')}-${mono.nom_francais
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')}.txt`;

    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, mono.contenu_complet, 'utf-8');
  }

  console.log(`\n💾 Fichiers individuels sauvegardés dans: ${OUTPUT_DIR}`);

  // Sauvegarder le JSON complet
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(monographies, null, 2), 'utf-8');
  console.log(`💾 JSON complet sauvegardé: ${OUTPUT_JSON}`);

  // Statistiques
  const stats = {
    total_monographies: monographies.length,
    familles: [...new Set(monographies.map(m => m.famille_botanique).filter(f => f))],
    parties_utilisees: [...new Set(monographies.map(m => m.partie_utilisee).filter(p => p))]
  };

  console.log('\n📈 Statistiques:');
  console.log(`   Familles botaniques: ${stats.familles.length}`);
  console.log(`   Parties utilisées différentes: ${stats.parties_utilisees.length}`);
}

main();
