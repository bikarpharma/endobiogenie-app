/**
 * Script de nettoyage et extraction Volume 3 Endobiogénie
 *
 * OBJECTIF: Extraire les pathologies et leurs traitements endobiogéniques
 * - Allergies
 * - Troubles thyroïdiens
 * - Troubles digestifs
 * - Troubles gynécologiques
 * - etc.
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../RAG/endobiogénie/volume3_final.md');
const OUTPUT_DIR = path.join(__dirname, '../RAG/endobiogenie/volume3');

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lire le fichier source
let content, lines;
try {
  content = fs.readFileSync(INPUT_FILE, 'utf-8');
  lines = content.split('\n');
  console.log(`📖 Volume 3 chargé: ${lines.length} lignes`);
} catch (e) {
  console.log('❌ Fichier volume3_final.md non trouvé');
  process.exit(1);
}

// ============================================================
// PARTIE 1: Extraction des Chapitres/Pathologies
// ============================================================

function extractPathologies() {
  console.log('\n🏥 Extraction des Pathologies...');

  // Trouver les chapitres
  const chapters = [];
  const chapterPattern = /^Chapter (\d+)/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(chapterPattern);
    if (match && lines[i].trim() === `Chapter ${match[1]}`) {
      // Trouver le titre (ligne suivante non vide)
      let title = '';
      for (let j = i + 1; j < i + 5 && j < lines.length; j++) {
        if (lines[j].trim() && !lines[j].match(/^\d+$/) && lines[j].trim().length > 3) {
          title = lines[j].trim();
          break;
        }
      }

      chapters.push({
        number: parseInt(match[1]),
        title: title,
        startLine: i
      });
    }
  }

  console.log(`   ${chapters.length} chapitres trouvés`);

  // Pour chaque chapitre, extraire les informations clés
  const pathologies = [];

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const endLine = chapters[i + 1]?.startLine || lines.length;

    // Joindre le texte du chapitre
    const chapterText = lines.slice(chapter.startLine, Math.min(endLine, chapter.startLine + 800))
      .join(' ')
      .replace(/\s+/g, ' ');

    // Extraire les sections clés
    const pathology = {
      chapitre: chapter.number,
      titre: translateTitle(chapter.title),
      titreOriginal: chapter.title,
      terrainPrecritique: extractSection(chapterText, /precritical terrain[:\s]+([^.]+(?:\.[^.]+){0,3})/i),
      terrainCritique: extractSection(chapterText, /critical terrain[:\s]+([^.]+(?:\.[^.]+){0,2})/i),
      cause: extractSection(chapterText, /[Cc]ause[:\s]+([^.]+)/i),
      axesImpliques: extractAxes(chapterText),
      plantesCitees: extractPlants(chapterText),
      conseilsCliniques: extractClinicalPearls(chapterText)
    };

    if (pathology.titre || pathology.terrainPrecritique) {
      pathologies.push(pathology);
    }
  }

  console.log(`   ✅ ${pathologies.length} pathologies extraites`);
  return pathologies;
}

function extractSection(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim().substring(0, 500) : '';
}

function extractAxes(text) {
  const axes = [];
  if (/cortico/i.test(text)) axes.push('corticotrope');
  if (/gonado/i.test(text)) axes.push('gonadotrope');
  if (/thyro/i.test(text)) axes.push('thyréotrope');
  if (/somato/i.test(text)) axes.push('somatotrope');
  return [...new Set(axes)];
}

function extractPlants(text) {
  const knownPlants = [
    'Ribes nigrum', 'Rhodiola rosea', 'Glycyrrhiza glabra', 'Taraxacum officinale',
    'Plantago major', 'Thymus vulgaris', 'Lavandula angustifolia', 'Salvia officinalis',
    'Achillea millefolium', 'Viola tricolor', 'Arctium lappa', 'Alchemilla vulgaris',
    'Vitex agnus', 'Melissa officinalis', 'Passiflora incarnata', 'Valeriana officinalis',
    'Echinacea purpurea', 'Euphrasia officinalis', 'Matricaria chamomilla', 'Urtica dioica',
    'Fumaria officinalis', 'Rosmarinus officinalis', 'Carduus marianus', 'Solidago virgaurea',
    'Crataegus oxyacantha', 'Ginkgo biloba', 'Hypericum perforatum', 'Curcuma longa',
    'Desmodium adscendens', 'Eschscholtzia californica', 'Avena sativa', 'Fucus vesiculosus'
  ];

  const found = [];
  for (const plant of knownPlants) {
    if (text.toLowerCase().includes(plant.toLowerCase())) {
      found.push(plant);
    }
  }

  return [...new Set(found)];
}

function extractClinicalPearls(text) {
  const pearls = [];
  const pearlPattern = /Clinical pearl[:\s]*([^.]+(?:\.[^C]+)?)/gi;

  let match;
  while ((match = pearlPattern.exec(text)) !== null) {
    const pearlText = match[1].trim().replace(/\s+/g, ' ').substring(0, 400);
    if (pearlText.length > 30 && !pearlText.includes('TABLE')) {
      pearls.push(pearlText);
    }
  }

  return pearls.slice(0, 5); // Max 5 pearls par chapitre
}

function translateTitle(title) {
  const translations = {
    'allergic disorders': 'Troubles allergiques',
    'allergies': 'Allergies',
    'eczema': 'Eczéma',
    'asthma': 'Asthme',
    'thyroid': 'Troubles thyroïdiens',
    'hypothyroid': 'Hypothyroïdie',
    'hyperthyroid': 'Hyperthyroïdie',
    'hashimoto': 'Hashimoto',
    'digestive': 'Troubles digestifs',
    'gastro': 'Gastro-entérologie',
    'ibs': 'Côlon irritable',
    'gynecol': 'Gynécologie',
    'menstrual': 'Troubles menstruels',
    'menopause': 'Ménopause',
    'skin': 'Dermatologie',
    'cardiovascular': 'Cardiovasculaire',
    'hypertension': 'Hypertension',
    'nervous': 'Neurologie',
    'anxiety': 'Anxiété',
    'depression': 'Dépression',
    'sleep': 'Sommeil',
    'infection': 'Infectiologie',
    'respiratory': 'Respiratoire',
    'urinary': 'Urologie',
    'musculoskeletal': 'Rhumatologie',
    'metabolic': 'Métabolisme',
    'diabetes': 'Diabète',
    'obesity': 'Obésité',
    'fatigue': 'Fatigue'
  };

  const lowerTitle = title.toLowerCase();
  for (const [key, value] of Object.entries(translations)) {
    if (lowerTitle.includes(key)) {
      return value;
    }
  }

  return title;
}

// ============================================================
// PARTIE 2: Extraction des Clinical Pearls globaux
// ============================================================

function extractAllClinicalPearls() {
  console.log('\n💎 Extraction des Clinical Pearls...');

  const pearls = [];
  const pattern = /Clinical pearl[:\s]*([^.]+(?:\.[^C]+)?)/gi;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const text = match[1].trim().replace(/\s+/g, ' ').substring(0, 400);
    if (text.length > 30 && !text.includes('TABLE') && !text.includes('Chapter')) {
      pearls.push({
        texte: text,
        position: match.index
      });
    }
  }

  console.log(`   ✅ ${pearls.length} clinical pearls extraits`);
  return pearls;
}

// ============================================================
// PARTIE 3: Base de données pathologies enrichie
// ============================================================

function getPathologiesDatabase() {
  return {
    allergies: {
      nom: 'Troubles allergiques',
      description: 'Hyperréactivité immunitaire à des allergènes',
      terrainPrecritique: {
        description: 'Hyperimmunité: surproduction d\'éléments immunitaires, spasmophilie latente, insuffisance cortico-surrénalienne',
        axes: ['corticotrope', 'thyréotrope'],
        sna: ['parasympathique élevé', 'alpha-sympathique élevé']
      },
      emonctoires: ['foie', 'intestins', 'peau'],
      traitementEndobiogenique: {
        drainage: ['Taraxacum officinale', 'Fumaria officinalis'],
        corticotrope: ['Ribes nigrum', 'Glycyrrhiza glabra'],
        immunitaire: ['Plantago major', 'Viola tricolor']
      },
      conseilsCliniques: [
        'Drainer le foie en priorité',
        'Réduire le terrain spasmophile',
        'Soutenir le cortex surrénalien'
      ]
    },
    hypothyroidie: {
      nom: 'Hypothyroïdie',
      description: 'Insuffisance thyroïdienne',
      terrainPrecritique: {
        description: 'Épuisement thyréotrope, compensation gonadotrope',
        axes: ['thyréotrope', 'gonadotrope']
      },
      traitementEndobiogenique: {
        thyreotrope: ['Fucus vesiculosus', 'Avena sativa'],
        drainage: ['Rosmarinus officinalis']
      }
    },
    troublesDigestifs: {
      nom: 'Troubles digestifs',
      description: 'Dysfonctionnements gastro-intestinaux',
      terrainPrecritique: {
        description: 'Vagotonie, spasmophilie digestive',
        axes: ['somatotrope', 'corticotrope'],
        sna: ['parasympathique dominant']
      },
      traitementEndobiogenique: {
        vagolytique: ['Artemisia dracunculus', 'Melissa officinalis'],
        digestif: ['Matricaria chamomilla', 'Foeniculum vulgare']
      }
    }
  };
}

// ============================================================
// EXÉCUTION PRINCIPALE
// ============================================================

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('🧬 NETTOYAGE VOLUME 3 - PATHOLOGIES');
  console.log('═══════════════════════════════════════════════');

  const pathologies = extractPathologies();
  const clinicalPearls = extractAllClinicalPearls();
  const pathologiesDB = getPathologiesDatabase();

  console.log('\n💾 Sauvegarde des fichiers...');

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pathologies-chapitres.json'),
    JSON.stringify({ pathologies, total: pathologies.length }, null, 2),
    'utf-8'
  );
  console.log(`   ✅ pathologies-chapitres.json (${pathologies.length} pathologies)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'clinical-pearls.json'),
    JSON.stringify({ pearls: clinicalPearls, total: clinicalPearls.length }, null, 2),
    'utf-8'
  );
  console.log(`   ✅ clinical-pearls.json (${clinicalPearls.length} pearls)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pathologies-database.json'),
    JSON.stringify(pathologiesDB, null, 2),
    'utf-8'
  );
  console.log('   ✅ pathologies-database.json');

  const readme = `# Volume 3 - Pathologies Endobiogéniques

Extraction du Volume 3 - Clinical Applications.

## Fichiers

| Fichier | Contenu | Usage |
|---------|---------|-------|
| pathologies-chapitres.json | ${pathologies.length} pathologies | Diagnostic |
| clinical-pearls.json | ${clinicalPearls.length} conseils | Aide clinique |
| pathologies-database.json | Base enrichie | Raisonnement |

*Extrait le ${new Date().toLocaleDateString('fr-FR')}*
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme, 'utf-8');
  console.log('   ✅ README.md');

  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════════════');
  console.log(`   Pathologies: ${pathologies.length}`);
  console.log(`   Clinical Pearls: ${clinicalPearls.length}`);

  if (pathologies.length > 0) {
    console.log('\n📋 Échantillon:');
    pathologies.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i+1}. Ch.${p.chapitre}: ${p.titre}`);
      console.log(`      Axes: ${p.axesImpliques.join(', ') || '-'}`);
    });
  }

  console.log('\n✅ Volume 3 terminé!');
}

main().catch(console.error);
