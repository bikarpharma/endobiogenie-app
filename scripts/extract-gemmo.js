/**
 * Script d'extraction et de classement du Grand Livre de la Gemmotherapie
 *
 * Double classement pour une precision RAG maximale :
 * 1. Par MONOGRAPHIE (bourgeon) - pour les questions sur une plante specifique
 * 2. Par SYSTEME/PATHOLOGIE - pour les questions sur un symptome
 *
 * Source: gemmotherapie_final.md (fichier deja nettoye)
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../RAG/gemmo/gemmotherapie_final.md');
const OUTPUT_DIR = path.join(__dirname, '../RAG/gemmo');
const BOURGEONS_DIR = path.join(OUTPUT_DIR, 'bourgeons');
const SYSTEMES_DIR = path.join(OUTPUT_DIR, 'systemes');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'gemmotherapie-complete.json');

// Liste des bourgeons - patterns pour detecter le debut de chaque monographie
const BOURGEONS_PATTERNS = [
  { nom: 'Bouleau pubescens', latin: 'Betula pubescens', pattern: /^BOULEAU PUBESCENS\s*:/i },
  { nom: 'Cassis', latin: 'Ribes nigrum', pattern: /^CASSIS\s*:\s*LE STIMULANT/i },
  { nom: 'Airelle', latin: 'Vaccinium vitis-idaea', pattern: /^AIRELLE\s*:/i },
  { nom: 'Amandier', latin: 'Prunus amygdalus', pattern: /^AMANDIER\s*:/i },
  { nom: 'Arbre de Judee', latin: 'Cercis siliquastrum', pattern: /^ARBRE DE JUD[EÉ]E\s*:/i },
  { nom: 'Argousier', latin: 'Hippophae rhamnoides', pattern: /^ARGOUSIER\s*:/i },
  { nom: 'Aubepine', latin: 'Crataegus', pattern: /^AUB[EÉ]PINE\s*:/i },
  { nom: 'Aulne', latin: 'Alnus glutinosa', pattern: /^AULNE\s*:/i },
  { nom: 'Bruyere', latin: 'Calluna vulgaris', pattern: /^BRUY[EÈ]RE\s*:/i },
  { nom: 'Cedre', latin: 'Cedrus', pattern: /^C[EÈ]DRE\s*:/i },
  { nom: 'Charme', latin: 'Carpinus betulus', pattern: /^CHARME\s*:/i },
  { nom: 'Chataignier', latin: 'Castanea sativa', pattern: /^CH[AÂ]TAIGNIER\s*:/i },
  { nom: 'Chene', latin: 'Quercus', pattern: /^CH[EÊ]NE\s*:/i },
  { nom: 'Citronnier', latin: 'Citrus limon', pattern: /^CITRONNIER\s*:/i },
  { nom: 'Cornouiller sanguin', latin: 'Cornus sanguinea', pattern: /^CORNOUILLER SANGUIN\s*:/i },
  { nom: 'Eglantier', latin: 'Rosa canina', pattern: /^[EÉ]GLANTIER\s*:/i },
  { nom: 'Erable', latin: 'Acer campestre', pattern: /^[EÉ]RABLE\s*:/i },
  { nom: 'Figuier', latin: 'Ficus carica', pattern: /^FIGUIER\s*:/i },
  { nom: 'Framboisier', latin: 'Rubus idaeus', pattern: /^FRAMBOISIER\s*:/i },
  { nom: 'Frene', latin: 'Fraxinus excelsior', pattern: /^FR[EÊ]NE\s*:/i },
  { nom: 'Genevrier', latin: 'Juniperus communis', pattern: /^GEN[EÉ]VRIER\s*:/i },
  { nom: 'Ginkgo', latin: 'Ginkgo biloba', pattern: /^GINKGO\s*:/i },
  { nom: 'Hetre', latin: 'Fagus sylvatica', pattern: /^H[EÊ]TRE\s*:/i },
  { nom: 'Lilas', latin: 'Syringa vulgaris', pattern: /^LILAS\s*:/i },
  { nom: 'Mais', latin: 'Zea mays', pattern: /^MA[IÏ]S\s*:/i },
  { nom: 'Marronnier', latin: 'Aesculus hippocastanum', pattern: /^MARRONNIER\s*:/i },
  { nom: 'Myrtillier', latin: 'Vaccinium myrtillus', pattern: /^MYRTILLIER\s*:/i },
  { nom: 'Noisetier', latin: 'Corylus avellana', pattern: /^NOISETIER\s*:/i },
  { nom: 'Noyer', latin: 'Juglans regia', pattern: /^NOYER\s*:/i },
  { nom: 'Olivier', latin: 'Olea europaea', pattern: /^OLIVIER\s*:/i },
  { nom: 'Orme', latin: 'Ulmus campestris', pattern: /^ORME\s*:/i },
  { nom: 'Peuplier', latin: 'Populus nigra', pattern: /^PEUPLIER\s*:/i },
  { nom: 'Pin', latin: 'Pinus', pattern: /^PIN\s*:/i },
  { nom: 'Platane', latin: 'Platanus orientalis', pattern: /^PLATANE\s*:/i },
  { nom: 'Pommier', latin: 'Malus communis', pattern: /^POMMIER\s*:/i },
  { nom: 'Romarin', latin: 'Rosmarinus officinalis', pattern: /^ROMARIN\s*:/i },
  { nom: 'Ronce', latin: 'Rubus fruticosus', pattern: /^RONCE\s*:/i },
  { nom: 'Sapin pectine', latin: 'Abies pectinata', pattern: /^SAPIN PECTIN[EÉ]\s*:/i },
  { nom: 'Saule', latin: 'Salix alba', pattern: /^SAULE\s*:/i },
  { nom: 'Seigle', latin: 'Secale cereale', pattern: /^SEIGLE\s*:/i },
  { nom: 'Sequoia', latin: 'Sequoia gigantea', pattern: /^S[EÉ]QUOIA\s*/i },
  { nom: 'Sorbier', latin: 'Sorbus domestica', pattern: /^SORBIER\s*:/i },
  { nom: 'Tamaris', latin: 'Tamarix gallica', pattern: /^TAMARIS\s*:/i },
  { nom: 'Tilleul', latin: 'Tilia tomentosa', pattern: /^TILLEUL\s*:/i },
  { nom: 'Vigne', latin: 'Vitis vinifera', pattern: /^VIGNE\s*:/i },
  { nom: 'Vigne vierge', latin: 'Ampelopsis veitchii', pattern: /^VIGNE VIERGE\s*:/i },
  { nom: 'Viorne', latin: 'Viburnum lantana', pattern: /^VIORNE\s*:/i },
];

// Chapitres systemes (Partie 3)
const SYSTEMES_PATTERNS = [
  { nom: 'systeme-nerveux', titre: 'Systeme Nerveux', pattern: /^CHAPITRE\s+\d+.*SYST[EÈ]ME NERVEUX/i },
  { nom: 'systeme-sanguin', titre: 'Systeme Sanguin et Lymphatique', pattern: /^CHAPITRE\s+\d+.*SYST[EÈ]ME SANGUIN/i },
  { nom: 'systeme-digestif', titre: 'Systeme Digestif', pattern: /^CHAPITRE\s+\d+.*SYST[EÈ]ME DIGESTIF/i },
  { nom: 'systeme-respiratoire', titre: 'Systeme Respiratoire', pattern: /^CHAPITRE\s+\d+.*SYST[EÈ]ME RESPIRATOIRE/i },
  { nom: 'systeme-osteoarticulaire', titre: 'Systeme Osteoarticulaire', pattern: /^CHAPITRE\s+\d+.*ARTICULATIONS|OST[EÉ]O/i },
  { nom: 'systeme-urinaire', titre: 'Systeme Urinaire', pattern: /^CHAPITRE\s+\d+.*URINAIRE/i },
  { nom: 'systeme-hormonal', titre: 'Systeme Hormonal', pattern: /^CHAPITRE\s+\d+.*HORMONES|ENDOCRIN/i },
  { nom: 'peau', titre: 'La Peau', pattern: /^CHAPITRE\s+\d+.*PEAU/i },
  { nom: 'immunite', titre: 'Immunite', pattern: /^CHAPITRE\s+\d+.*IMMUNIT[EÉ]/i },
];

function loadFile(filepath) {
  console.log(`[LOAD] Chargement de ${path.basename(filepath)}...`);
  return fs.readFileSync(filepath, 'utf-8');
}

function findAllBourgeonSections(text) {
  const lines = text.split('\n');
  const sections = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    for (const bp of BOURGEONS_PATTERNS) {
      if (bp.pattern.test(line)) {
        sections.push({
          nom: bp.nom,
          latin: bp.latin,
          startLine: i,
          title: line
        });
        break;
      }
    }
  }

  // Trier par ligne de debut
  sections.sort((a, b) => a.startLine - b.startLine);

  // Determiner les fins de section
  for (let i = 0; i < sections.length; i++) {
    if (i < sections.length - 1) {
      sections[i].endLine = sections[i + 1].startLine - 1;
    } else {
      // Derniere section: chercher "PARTIE 3" ou fin du fichier
      let endLine = lines.length - 1;
      for (let j = sections[i].startLine; j < lines.length; j++) {
        if (lines[j].includes('PARTIE 3') || lines[j].includes('PRENDRE SOIN DE SOI')) {
          endLine = j - 1;
          break;
        }
      }
      sections[i].endLine = endLine;
    }
  }

  console.log(`   [OK] ${sections.length} bourgeons detectes`);
  return sections;
}

function extractBourgeonContent(text, section) {
  const lines = text.split('\n');
  let content = lines.slice(section.startLine, section.endLine + 1).join('\n');

  // Nettoyer
  content = content
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return {
    nom: section.nom,
    nom_latin: section.latin,
    ligne_debut: section.startLine,
    ligne_fin: section.endLine,
    contenu: content,
    source: 'Le Grand Livre de la Gemmotherapie - Laurine Pineau'
  };
}

function findPartie3Start(text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('PARTIE 3') ||
        lines[i].includes('PRENDRE SOIN DE SOI AVEC LA GEMMOTH')) {
      return i;
    }
  }
  return -1;
}

// Chapitres non pertinents pour le RAG therapeutique (a exclure)
const CHAPITRES_EXCLUS = [
  'phytosociologie',
  'message des arbres',
  'ogham',
  'celtique',
  'prévention',  // Trop general
  'prevention'   // Sans accent
];

function extractSystemeSections(text) {
  const lines = text.split('\n');
  const partie3Start = findPartie3Start(text);

  if (partie3Start === -1) {
    console.log('   [WARN] Partie 3 non trouvee');
    return [];
  }

  console.log(`   Partie 3 commence a la ligne ${partie3Start}`);

  // Chercher les chapitres dans la Partie 3
  const chapitres = [];

  // Pattern generique pour les chapitres
  const chapitrePattern = /^CHAPITRE\s+\d+/i;

  for (let i = partie3Start; i < lines.length; i++) {
    const line = lines[i].trim();
    if (chapitrePattern.test(line)) {
      // Chercher le titre du chapitre (concatener les lignes suivantes non vides jusqu'a un titre complet)
      let titreLines = [];
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.length === 0) continue;
        // Arreter si on atteint une section comme "QUELQUES BOURGEONS"
        if (nextLine.startsWith('QUELQUES') || nextLine.startsWith('SPÉCIFIQUE')) break;
        titreLines.push(nextLine);
        // Si le titre semble complet (contient un mot-cle systeme)
        const combined = titreLines.join(' ');
        if (/NERVEUX|SANGUIN|DIGESTIF|RESPIRATOIRE|CARDIAQUE|UROGÉNITAL|OSTÉOARTICULAIRE|IMMUNITAIRE|PEAU/i.test(combined)) {
          break;
        }
        // Limiter a 3 lignes max
        if (titreLines.length >= 3) break;
      }

      const titre = titreLines.join(' ').replace(/\s+/g, ' ');

      chapitres.push({
        ligne: i,
        header: line,
        titre: titre
      });
    }
  }

  // Determiner les contenus
  const systemes = [];
  for (let i = 0; i < chapitres.length; i++) {
    const startLine = chapitres[i].ligne;
    const endLine = i < chapitres.length - 1
      ? chapitres[i + 1].ligne - 1
      : lines.length - 1;

    const content = lines.slice(startLine, endLine + 1).join('\n');

    // Verifier si le chapitre doit etre exclu
    const titreNorm = chapitres[i].titre.toLowerCase();
    const exclu = CHAPITRES_EXCLUS.some(ex => titreNorm.includes(ex));
    if (exclu) {
      console.log(`   [SKIP] Chapitre exclu: ${chapitres[i].titre}`);
      continue;
    }

    // Determiner le nom du fichier (ameliore - limite a 50 caracteres)
    let filename = chapitres[i].titre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .substring(0, 50)
      .replace(/-+$/, '');

    systemes.push({
      filename: filename,
      titre: chapitres[i].titre,
      contenu: content.replace(/\n{3,}/g, '\n\n').trim(),
      source: 'Le Grand Livre de la Gemmotherapie - Laurine Pineau'
    });
  }

  console.log(`   [OK] ${systemes.length} chapitres systemes detectes (apres filtrage)`);
  return systemes;
}

function saveBourgeons(bourgeons) {
  if (!fs.existsSync(BOURGEONS_DIR)) {
    fs.mkdirSync(BOURGEONS_DIR, { recursive: true });
  }

  for (const bourgeon of bourgeons) {
    const filename = bourgeon.nom
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.md';

    const filepath = path.join(BOURGEONS_DIR, filename);

    const content = `# ${bourgeon.nom}
## ${bourgeon.nom_latin}

**Source:** ${bourgeon.source}

---

${bourgeon.contenu}
`;

    fs.writeFileSync(filepath, content, 'utf-8');
  }

  console.log(`[SAVE] ${bourgeons.length} fichiers bourgeons -> ${BOURGEONS_DIR}`);
}

function saveSystemes(systemes) {
  if (!fs.existsSync(SYSTEMES_DIR)) {
    fs.mkdirSync(SYSTEMES_DIR, { recursive: true });
  }

  for (const sys of systemes) {
    const filepath = path.join(SYSTEMES_DIR, sys.filename + '.md');

    const content = `# ${sys.titre}

**Source:** ${sys.source}

---

${sys.contenu}
`;

    fs.writeFileSync(filepath, content, 'utf-8');
  }

  console.log(`[SAVE] ${systemes.length} fichiers systemes -> ${SYSTEMES_DIR}`);
}

function saveJSON(bourgeons, systemes) {
  const data = {
    source: 'Le Grand Livre de la Gemmotherapie - Laurine Pineau',
    extraction_date: new Date().toISOString(),
    total_bourgeons: bourgeons.length,
    total_systemes: systemes.length,
    bourgeons: bourgeons.map(b => ({
      nom: b.nom,
      nom_latin: b.nom_latin,
      contenu: b.contenu
    })),
    systemes: systemes.map(s => ({
      titre: s.titre,
      contenu: s.contenu
    }))
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[SAVE] JSON complet: ${OUTPUT_JSON}`);
  console.log(`   Taille: ${(fs.statSync(OUTPUT_JSON).size / 1024).toFixed(1)} Ko`);
}

function printStats(bourgeons, systemes) {
  console.log('\n[STATS] Statistiques:');
  console.log(`   Bourgeons: ${bourgeons.length}`);
  console.log(`   Systemes/Chapitres: ${systemes.length}`);

  console.log('\n   Bourgeons extraits:');
  for (const b of bourgeons.slice(0, 10)) {
    console.log(`      - ${b.nom} (${b.nom_latin})`);
  }
  if (bourgeons.length > 10) {
    console.log(`      ... et ${bourgeons.length - 10} autres`);
  }

  console.log('\n   Systemes extraits:');
  for (const s of systemes) {
    console.log(`      - ${s.titre}`);
  }
}

function main() {
  console.log('='.repeat(60));
  console.log('[GEMMO] Extraction Double Classement');
  console.log('='.repeat(60));

  if (!fs.existsSync(INPUT_FILE)) {
    console.log(`[ERREUR] Fichier non trouve: ${INPUT_FILE}`);
    return;
  }

  // Charger le fichier MD (deja nettoye)
  const text = loadFile(INPUT_FILE);
  const lines = text.split('\n');
  console.log(`   Total: ${lines.length} lignes`);

  // 1. Extraire les monographies de bourgeons (Partie 2)
  console.log('\n[STEP 1] Extraction des monographies par bourgeon...');
  const bourgeonSections = findAllBourgeonSections(text);

  const bourgeons = [];
  for (const section of bourgeonSections) {
    const bourgeon = extractBourgeonContent(text, section);
    if (bourgeon.contenu.length > 200) {
      bourgeons.push(bourgeon);
    }
  }

  // 2. Extraire les chapitres systemes (Partie 3)
  console.log('\n[STEP 2] Extraction des chapitres par systeme...');
  const systemes = extractSystemeSections(text);

  // 3. Sauvegarder les fichiers
  console.log('\n[STEP 3] Sauvegarde des fichiers...');
  saveBourgeons(bourgeons);
  saveSystemes(systemes);
  saveJSON(bourgeons, systemes);

  // 4. Statistiques
  printStats(bourgeons, systemes);

  console.log('\n' + '='.repeat(60));
  console.log('[OK] Extraction terminee!');
  console.log('='.repeat(60));
}

main();
