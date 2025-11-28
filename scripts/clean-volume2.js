/**
 * Script de nettoyage et extraction Volume 2 Endobiogénie
 *
 * OBJECTIF: Extraire les données structurées pour le RAG:
 * - Matière Médicale (79 plantes)
 * - Axes Endocriniens
 * - SNA (Para/Alpha/Bêta)
 * - Émonctoires
 * - Conseils cliniques
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../RAG/endobiogénie/volume2_final.md');
const OUTPUT_DIR = path.join(__dirname, '../RAG/endobiogenie/volume2');

// Créer le dossier de sortie
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lire le fichier source
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

console.log(`📖 Volume 2 chargé: ${lines.length} lignes`);

// ============================================================
// PARTIE 1: Extraction de la Matière Médicale (Chapitre 43)
// ============================================================

function extractMatiereMediale() {
  console.log('\n🌿 Extraction de la Matière Médicale...');

  // Le chapitre 43 commence à la ligne 14250 (Matière médicale)
  // et se termine vers la ligne 15222 (Section E)
  const startLine = 14250;
  const endLine = 15222;

  console.log(`   Recherche dans les lignes ${startLine} à ${endLine}`);

  // Joindre tout le texte du chapitre et nettoyer
  const chapterText = lines.slice(startLine, endLine).join(' ').replace(/\s+/g, ' ');

  // Pattern pour trouver les noms de plantes latins
  // Format: "Nom latin (Nom commun)" ou "Nom latin, partie (Nom commun)"
  const plantNamePattern = /([A-Z][a-z]+ [a-z]+(?:,? [a-z]+)?)\s*\(([^)]+)\)/g;

  // Trouver toutes les plantes
  const plantNames = [];
  let match;
  while ((match = plantNamePattern.exec(chapterText)) !== null) {
    const nomLatin = match[1].trim();
    const nomCommun = match[2].trim();

    // Filtrer les faux positifs (tableaux, références, etc.)
    if (nomLatin.length > 5 &&
        !nomLatin.includes('TABLEAU') &&
        !nomLatin.includes('Section') &&
        !nomLatin.includes('Figure') &&
        !nomCommun.includes('voir') &&
        nomLatin.match(/^[A-Z][a-z]+ [a-z]/)) {
      plantNames.push({
        nomLatin,
        nomCommun,
        position: match.index
      });
    }
  }

  console.log(`   ${plantNames.length} noms de plantes trouvés`);

  // Extraire le contenu pour chaque plante
  const plantes = [];

  for (let i = 0; i < plantNames.length; i++) {
    const plant = plantNames[i];
    const nextPosition = plantNames[i + 1]?.position || chapterText.length;

    // Extraire le texte entre cette plante et la suivante
    const plantText = chapterText.substring(plant.position, nextPosition);

    // Parser les données
    const parsed = parsePlantData(plant, plantText);

    // Ne garder que les plantes avec du contenu significatif
    if (parsed.essence || parsed.resume) {
      plantes.push(parsed);
    }
  }

  console.log(`   ✅ ${plantes.length} plantes extraites avec contenu`);
  return plantes;
}

function parsePlantData(plant, text) {
  // Nettoyer le texte
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Debug désactivé
  // if (plant.nomLatin.startsWith('A')) {
  //   console.log(`   DEBUG: ${plant.nomLatin} - "${cleanText.substring(0, 300)}..."`);
  // }

  // Extraire les sections avec patterns plus robustes (le texte OCR mélange les colonnes)
  // Essence peut être suivie de texte puis Résumé
  const essenceMatch = cleanText.match(/Essence\s*:\s*([^.]+(?:\.[^.R]+)?)/i);
  const resumeMatch = cleanText.match(/Résumé\s*:\s*([^.]+(?:\.[^.P]+)?)/i);
  const partiesMatch = cleanText.match(/Parties utilisées\s*:\s*([^.G]+)/i);
  const galeniqueMatch = cleanText.match(/Galénique\s*:\s*([A-Z,\s]+)/i);
  const methodeMatch = cleanText.match(/Méthode\s*:\s*([^.]+(?:\.[^.N]+)?)/i);
  const notesMatch = cleanText.match(/Notes et précautions\s*:\s*([^.]+)/i);

  // Extraire les axes endocriniens mentionnés
  const axes = [];
  if (/cortico/i.test(cleanText)) axes.push('corticotrope');
  if (/gonado/i.test(cleanText)) axes.push('gonadotrope');
  if (/thyréo|thyreo/i.test(cleanText)) axes.push('thyréotrope');
  if (/somato/i.test(cleanText)) axes.push('somatotrope');

  // Extraire les indications clés
  const indications = [];
  const indicationPatterns = [
    [/inflam/i, 'anti-inflammatoire'],
    [/infect/i, 'anti-infectieux'],
    [/spasm/i, 'antispasmodique'],
    [/drain/i, 'draineur'],
    [/immun/i, 'immunomodulateur'],
    [/digest/i, 'digestif'],
    [/hépa|hepa|foie/i, 'hépatique'],
    [/nerv|neuro|SNC|anxie|calm/i, 'nerveux'],
    [/respir|pulmon|bronch/i, 'respiratoire'],
    [/derma|peau|cutan/i, 'dermatologique'],
    [/génit|utér|ovair|prostat/i, 'génital'],
    [/œstro|estro/i, 'œstrogénique'],
    [/progest/i, 'progestéronique'],
    [/andro/i, 'androgénique'],
    [/cortisol/i, 'cortisolique'],
    [/vago/i, 'vagolytique'],
    [/sympath/i, 'sympathique'],
    [/diurét/i, 'diurétique'],
    [/cholérét|cholagog/i, 'cholérétique'],
    [/hypoglycém/i, 'hypoglycémiant'],
    [/sédatif|somnifère/i, 'sédatif'],
    [/tonique/i, 'tonique'],
    [/adapt[oa]/i, 'adaptogène'],
  ];

  for (const [pattern, indication] of indicationPatterns) {
    if (pattern.test(cleanText)) {
      indications.push(indication);
    }
  }

  return {
    nomLatin: plant.nomLatin,
    nomCommun: plant.nomCommun,
    essence: essenceMatch ? essenceMatch[1].trim().replace(/\s+/g, ' ') : '',
    resume: resumeMatch ? resumeMatch[1].trim().replace(/\s+/g, ' ') : '',
    partiesUtilisees: partiesMatch ? partiesMatch[1].trim() : '',
    galenique: galeniqueMatch ? galeniqueMatch[1].trim() : '',
    methode: methodeMatch ? methodeMatch[1].trim().substring(0, 300) : '',
    precautions: notesMatch ? notesMatch[1].trim() : '',
    axes: [...new Set(axes)],
    indications: [...new Set(indications)],
  };
}

// ============================================================
// PARTIE 2: Extraction des Conseils Cliniques
// ============================================================

function extractConseilsCliniques() {
  console.log('\n💡 Extraction des Conseils Cliniques...');

  const conseils = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.includes('Conseils cliniques')) {
      // Extraire le contexte (10 lignes avant et 30 lignes après)
      const contextStart = Math.max(0, i - 5);
      const contextEnd = Math.min(lines.length, i + 30);

      let conseil = {
        titre: line.trim(),
        contexte: '',
        contenu: ''
      };

      // Trouver le contexte (chapitre/section)
      for (let j = i - 1; j >= contextStart; j--) {
        if (lines[j].includes('Chapitre') || lines[j].includes('Axe') ||
            lines[j].match(/^[A-Z][a-zé]+trope/) || lines[j].includes('Émonctoire')) {
          conseil.contexte = lines[j].trim();
          break;
        }
      }

      // Extraire le contenu
      const contenuLines = [];
      for (let j = i + 1; j < contextEnd; j++) {
        const l = lines[j].trim();
        if (l.includes('Conseils cliniques') || l.includes('Chapitre') || l === '') {
          if (contenuLines.length > 0) break;
        } else {
          contenuLines.push(l);
        }
      }

      conseil.contenu = contenuLines.join(' ').replace(/\s+/g, ' ').substring(0, 500);

      if (conseil.contenu.length > 50) {
        conseils.push(conseil);
      }
    }
    i++;
  }

  console.log(`   ✅ ${conseils.length} conseils extraits`);
  return conseils;
}

// ============================================================
// PARTIE 3: Données Structurées Fixes (basées sur le contenu lu)
// ============================================================

function getAxesEndocriniens() {
  return {
    corticotrope: {
      nom: 'Axe Corticotrope',
      description: 'Assure la survie à travers l\'adaptation, l\'économie d\'énergie, la mobilisation et la distribution des métabolites.',
      hormones: {
        centrales: ['CRH', 'ACTH', 'α-MSH', 'β-MSH', 'β-endorphine'],
        peripheriques: ['Cortisol', 'Aldostérone', 'DHEA', 'Androgènes surrénaliens']
      },
      metabolisme: 'Catabolisme (1ère boucle: cortisol) > Anabolisme (2ème boucle: aldostérone, androgènes)',
      emonctoires: ['peau', 'reins', 'vessie', 'foie', 'intestins'],
      metabolites: ['Hydrates de carbone', 'Protéines', 'Lipides', 'Sodium', 'Potassium'],
      plantesReferencees: [
        { nom: 'Rhodiola rosea', action: 'Soutient l\'ACTH' },
        { nom: 'Quercus pedunculata', action: 'Soutient l\'ACTH' },
        { nom: 'Inula helenium', action: 'Soutient l\'ACTH' },
        { nom: 'Ribes nigrum', action: 'Cortisol-like' },
        { nom: 'Glycyrrhiza glabra', action: 'Prolonge le cortisol' },
        { nom: 'Arnica montana', action: 'Anti-vasopressine' }
      ],
      indexBDF: ['Cortisol', 'ACTH', 'Aldostérone', 'Androgènes surrénaliens', 'β-MSH/α-MSH']
    },
    gonadotrope: {
      nom: 'Axe Gonadotrope',
      description: 'Gère la reproduction et la différenciation sexuelle, ainsi que l\'anabolisme tissulaire.',
      hormones: {
        centrales: ['GnRH', 'FSH', 'LH', 'Prolactine'],
        peripheriques: ['Œstrogènes', 'Progestérone', 'Testostérone']
      },
      metabolisme: 'Anabolisme tissulaire et structural',
      emonctoires: ['foie', 'intestins'],
      plantesReferencees: [
        { nom: 'Vitex agnus-castus', action: 'Régule LH/FSH' },
        { nom: 'Alchemilla vulgaris', action: 'Progestérone-like' },
        { nom: 'Salvia officinalis', action: 'Œstrogène-like' },
        { nom: 'Achillea millefolium', action: 'Régulateur gonado' }
      ],
      indexBDF: ['FSH', 'LH', 'Œstrogènes', 'Progestérone', 'Testostérone', 'Rapport Œstrogènes/Androgènes']
    },
    thyreotrope: {
      nom: 'Axe Thyréotrope',
      description: 'Régule le métabolisme cellulaire et l\'adaptation à l\'environnement.',
      hormones: {
        centrales: ['TRH', 'TSH'],
        peripheriques: ['T4', 'T3', 'rT3']
      },
      metabolisme: 'Catabolisme cellulaire - oxydation',
      emonctoires: ['poumons', 'foie', 'intestins'],
      plantesReferencees: [
        { nom: 'Fucus vesiculosus', action: 'Stimule thyroïde' },
        { nom: 'Lycopus europaeus', action: 'Freine thyroïde' },
        { nom: 'Melissa officinalis', action: 'Modulateur thyroïdien' }
      ],
      indexBDF: ['TSH', 'T4', 'T3', 'Rendement thyroïdien', 'Index de conversion']
    },
    somatotrope: {
      nom: 'Axe Somatotrope',
      description: 'Gère la croissance, la réparation tissulaire et le métabolisme glucidique.',
      hormones: {
        centrales: ['GHRH', 'GH', 'Somatostatine'],
        peripheriques: ['IGF-1', 'Insuline', 'Glucagon']
      },
      metabolisme: 'Anabolisme structural et métabolisme glucidique',
      emonctoires: ['foie', 'pancréas'],
      plantesReferencees: [
        { nom: 'Avena sativa', action: 'Tonique général' },
        { nom: 'Trigonella foenum-graecum', action: 'Régule glycémie' }
      ],
      indexBDF: ['GH', 'IGF-1', 'Insuline', 'Index pancréatique', 'Index d\'adaptation']
    }
  };
}

function getSNA() {
  return {
    parasympathique: {
      nom: 'Système Parasympathique (πΣ)',
      abreviation: 'πΣ',
      autacoide: 'Sérotonine',
      role: 'Initie - Taux du métabolisme basal',
      actions: {
        metabolisme: 'Taux du métabolisme basal',
        endocrinien: 'Taux basal de sécrétion (production)',
        SNC_sensitif: 'Réception d\'une information',
        SNC_moteur: 'Conceptualisation',
        SNP_sensitif: 'Seuil de sensation',
        SNP_moteur: 'Contraction - seuil basal',
        SNI: 'Taux basal de motricité',
        emonctoire: 'Niveau basal du débit circulatoire, taux basal détoxification'
      },
      hyperactivite: {
        signes: ['vagotonie', 'hypersécrétion', 'spasmes', 'bradycardie', 'hypotension'],
        terrains: ['spasmophilie', 'terrain allergique', 'hyperémotivité']
      },
      hypoactivite: {
        signes: ['asthénie', 'atonie', 'hypomotilité'],
        terrains: ['épuisement', 'dépression']
      }
    },
    alphasympathique: {
      nom: 'Système Alpha-Sympathique (αΣ)',
      abreviation: 'αΣ',
      autacoide: 'Histamine',
      role: 'Calibre - Étalonnage de la durée et intensité',
      actions: {
        metabolisme: 'Étalonnage de la durée ou de l\'intensité du métabolisme',
        endocrinien: 'Étalonnage de la durée ou de l\'intensité de la sécrétion',
        SNC_sensitif: 'Vigilance, contextualisation de l\'information',
        SNC_moteur: 'Planification',
        SNP_sensitif: 'Intensité de la sensation',
        SNP_moteur: 'Étalonnage du minutage et de l\'intensité de la contraction',
        SNI: 'Étalonnage du minutage et de l\'intensité de la motricité',
        emonctoire: 'Congestion, calibration du taux de détoxification'
      },
      hyperactivite: {
        signes: ['inflammation', 'congestion', 'hyperadaptation', 'insomnie', 'hypertension'],
        terrains: ['terrain inflammatoire', 'stress chronique', 'allergies']
      },
      hypoactivite: {
        signes: ['insuffisance adaptative', 'fatigue'],
        terrains: ['épuisement surrénalien']
      }
    },
    betasympathique: {
      nom: 'Système Bêta-Sympathique (βΣ)',
      abreviation: 'βΣ',
      autacoide: null,
      role: 'Termine - Accélération et achèvement',
      actions: {
        metabolisme: 'Accélération et achèvement du métabolisme',
        endocrinien: 'Excrétion d\'une hormone à partir de sa glande',
        SNC_sensitif: 'Filiation de l\'information',
        SNC_moteur: 'Exécution',
        SNP_sensitif: 'Propagation de l\'information',
        SNP_moteur: 'Contraction',
        SNI: 'Contraction',
        emonctoire: 'Décongestion, excrétion de toxines'
      },
      hyperactivite: {
        signes: ['épuisement', 'suradaptation', 'tachycardie', 'tremblements'],
        terrains: ['hyperthyroïdie', 'anxiété', 'stress aigu']
      },
      hypoactivite: {
        signes: ['stagnation', 'accumulation', 'rétention'],
        terrains: ['hypothyroïdie', 'constipation']
      }
    },
    sequence: 'πΣ → αΣ → βΣ (Para initie, Alpha calibre, Bêta termine)',
    conseil: 'En endobiogénie, la séquence du SNA est programmée. Les autacoïdes calibrent l\'intensité et la durée.'
  };
}

function getEmonctoires() {
  return {
    foie: {
      nom: 'Foie',
      axes: ['corticotrope', 'thyréotrope', 'gonadotrope', 'somatotrope'],
      fonctions: [
        'Détoxification des métabolites',
        'Métabolisme des hormones',
        'Stockage du glycogène',
        'Production de bile',
        'Synthèse protéique'
      ],
      signesCongestion: [
        'Réveil nocturne entre 1h et 3h',
        'Intolérance aux graisses',
        'Fatigue matinale',
        'Nausées',
        'Teint jaunâtre',
        'Céphalées hépatiques'
      ],
      conseilClinique: 'En cas de doute, drainer le foie. Le drainage hépatobiliaire peut résoudre de nombreux troubles apparemment non liés.',
      plantesdraineurs: [
        { nom: 'Taraxacum officinale', action: 'Cholagogue et cholérétique' },
        { nom: 'Rosmarinus officinalis', action: 'Hépatoprotecteur, cholérétique' },
        { nom: 'Carduus marianus', action: 'Hépatoprotecteur, régénérateur' },
        { nom: 'Chelidonium majus', action: 'Antispasmodique biliaire' }
      ]
    },
    reins: {
      nom: 'Reins',
      axes: ['corticotrope'],
      fonctions: [
        'Filtration du sang',
        'Équilibre hydro-électrolytique',
        'Régulation de la pression artérielle',
        'Élimination des déchets azotés'
      ],
      signesCongestion: [
        'Œdèmes des membres inférieurs',
        'Hypertension',
        'Lombalgie',
        'Urines foncées ou troubles'
      ],
      plantesdraineurs: [
        { nom: 'Solidago virgaurea', action: 'Diurétique, anti-inflammatoire urinaire' },
        { nom: 'Orthosiphon stamineus', action: 'Diurétique puissant' },
        { nom: 'Pilosella', action: 'Diurétique, éliminateur urée' }
      ]
    },
    poumons: {
      nom: 'Poumons',
      axes: ['thyréotrope'],
      fonctions: [
        'Échanges gazeux O2/CO2',
        'Élimination du CO2',
        'Barrière immunitaire',
        'Régulation pH sanguin'
      ],
      signesCongestion: [
        'Toux productive ou sèche',
        'Dyspnée',
        'Infections ORL récurrentes',
        'Oppression thoracique'
      ],
      plantesdraineurs: [
        { nom: 'Plantago major', action: 'Expectorant, anti-inflammatoire' },
        { nom: 'Thymus vulgaris', action: 'Antiseptique respiratoire' },
        { nom: 'Eucalyptus globulus', action: 'Expectorant, antiseptique' },
        { nom: 'Hyssopus officinalis', action: 'Fluidifiant bronchique' }
      ]
    },
    peau: {
      nom: 'Peau',
      axes: ['corticotrope'],
      fonctions: [
        'Élimination des toxines par sudation',
        'Thermorégulation',
        'Barrière protectrice',
        'Synthèse vitamine D'
      ],
      signesCongestion: [
        'Eczéma',
        'Acné',
        'Prurit',
        'Éruptions cutanées',
        'Transpiration excessive ou insuffisante'
      ],
      plantesdraineurs: [
        { nom: 'Viola tricolor', action: 'Dépuratif cutané' },
        { nom: 'Arctium lappa', action: 'Draineur cutané polyvalent' },
        { nom: 'Fumaria officinalis', action: 'Dépuratif, régulateur biliaire' }
      ]
    },
    intestins: {
      nom: 'Intestins',
      axes: ['corticotrope', 'thyréotrope', 'gonadotrope'],
      fonctions: [
        'Absorption des nutriments',
        'Élimination des déchets',
        'Barrière immunitaire (GALT)',
        'Production de sérotonine'
      ],
      signesCongestion: [
        'Constipation',
        'Ballonnements',
        'Dysbiose',
        'Perméabilité intestinale'
      ],
      conseilClinique: 'Le tractus GI est le lieu où tous les éléments clés du terrain se rencontrent: neuroendocrinien, immunité, émonctoires, pouvoir tampon.',
      plantesdraineurs: [
        { nom: 'Malva sylvestris', action: 'Adoucissant, laxatif doux' },
        { nom: 'Aloe vera', action: 'Laxatif, cicatrisant' },
        { nom: 'Plantago psyllium', action: 'Régulateur du transit' }
      ]
    }
  };
}

// ============================================================
// EXÉCUTION PRINCIPALE
// ============================================================

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('🧬 NETTOYAGE VOLUME 2 - ENDOBIOGÉNIE');
  console.log('═══════════════════════════════════════════════');

  // 1. Matière Médicale (extraction dynamique)
  const plantes = extractMatiereMediale();

  // 2. Conseils Cliniques (extraction dynamique)
  const conseils = extractConseilsCliniques();

  // 3. Données structurées (basées sur le contenu analysé)
  const axes = getAxesEndocriniens();
  const sna = getSNA();
  const emonctoires = getEmonctoires();

  // Sauvegarder les fichiers JSON
  console.log('\n💾 Sauvegarde des fichiers...');

  // Matière médicale
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'matiere-medicale.json'),
    JSON.stringify({ plantes, total: plantes.length, source: 'Volume 2, Chapitre 43' }, null, 2),
    'utf-8'
  );
  console.log(`   ✅ matiere-medicale.json (${plantes.length} plantes)`);

  // Conseils cliniques
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'conseils-cliniques.json'),
    JSON.stringify({ conseils, total: conseils.length }, null, 2),
    'utf-8'
  );
  console.log(`   ✅ conseils-cliniques.json (${conseils.length} conseils)`);

  // Axes
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'axes-endocriniens.json'),
    JSON.stringify(axes, null, 2),
    'utf-8'
  );
  console.log('   ✅ axes-endocriniens.json');

  // SNA
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'sna.json'),
    JSON.stringify(sna, null, 2),
    'utf-8'
  );
  console.log('   ✅ sna.json');

  // Émonctoires
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'emonctoires.json'),
    JSON.stringify(emonctoires, null, 2),
    'utf-8'
  );
  console.log('   ✅ emonctoires.json');

  // Créer un fichier README
  const readme = `# Volume 2 - Endobiogénie Clinique

Extraction structurée du Volume 2 "La Théorie de l'Endobiogénie" par K.M. Hedayat.

## Fichiers

| Fichier | Contenu | Usage RAG |
|---------|---------|-----------|
| matiere-medicale.json | ${plantes.length} plantes médicinales | Raisonnement thérapeutique |
| conseils-cliniques.json | ${conseils.length} conseils | Aide au diagnostic |
| axes-endocriniens.json | 4 axes + plantes | Interprétation BDF |
| sna.json | Para/Alpha/Bêta | Diagnostic terrain |
| emonctoires.json | 5 émonctoires + draineurs | Stratégie drainage |

## Intégration SaaS

### therapeuticReasoning.ts
- Utiliser \`matiere-medicale.json\` pour choisir les plantes
- Filtrer par axes impliqués et indications

### BdfResultsView.tsx
- Utiliser \`axes-endocriniens.json\` pour interpréter les index
- Afficher les conseils cliniques pertinents

### clinicalScoringV2.ts
- Utiliser \`sna.json\` pour qualifier le terrain SNA
- Utiliser \`emonctoires.json\` pour identifier les drainages nécessaires

---
*Extrait le ${new Date().toLocaleDateString('fr-FR')}*
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readme, 'utf-8');
  console.log('   ✅ README.md');

  // Stats finales
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════════════');
  console.log(`   Plantes extraites: ${plantes.length}`);
  console.log(`   Conseils cliniques: ${conseils.length}`);
  console.log(`   Axes documentés: 4`);
  console.log(`   Émonctoires: 5`);
  console.log(`   Fichiers créés: 6`);

  // Afficher quelques plantes pour vérification
  if (plantes.length > 0) {
    console.log('\n📋 Échantillon de plantes extraites:');
    plantes.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i+1}. ${p.nomLatin} (${p.nomCommun})`);
      console.log(`      Axes: ${p.axes.join(', ') || 'non spécifié'}`);
      console.log(`      Indications: ${p.indications.slice(0, 3).join(', ') || 'non spécifié'}`);
    });
  }

  console.log('\n✅ Nettoyage Volume 2 terminé!');
}

main().catch(console.error);
