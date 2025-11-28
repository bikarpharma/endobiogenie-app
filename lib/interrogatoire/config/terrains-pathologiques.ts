import type { QuestionConfig } from "../types";

/**
 * TERRAINS PATHOLOGIQUES TRANSVERSAUX
 * ------------------------------------
 * Questions ciblées pour identifier les grands terrains endobiogéniques :
 * - SPASMOPHILE (Dystonie SNA + déficit magnésium)
 * - ATOPIQUE (Th2 dominant, histamine)
 * - AUTO-IMMUN (Th1/Th17 dérégulé)
 * - CONGESTIF (Stase hépato-splanchnique)
 * - MÉTABOLIQUE (Insulino-résistance, syndrome X)
 * - DÉGÉNÉRATIF (Vieillissement accéléré)
 *
 * Ces questions COMPLÈTENT les axes existants pour une détection fine des terrains.
 */

const TerrainsPathologiquesConfig: QuestionConfig[] = [
  // ==========================================
  // 1. TERRAIN SPASMOPHILE (Dystonie SNA)
  // ==========================================
  {
    id: "terrain_spasmo_crampes",
    question: "Avez-vous des crampes musculaires nocturnes (mollets, pieds) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe classique de déficit magnésien avec hyperexcitabilité neuromusculaire.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Spasmophile"
  },
  {
    id: "terrain_spasmo_paupiere",
    question: "Avez-vous des tressautements de paupière (fasciculations) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Marqueur fin de déplétion magnésienne et d'hyperexcitabilité nerveuse.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Spasmophile"
  },
  {
    id: "terrain_spasmo_oppression",
    question: "Ressentez-vous une oppression thoracique (boule, poids) sans cause cardiaque ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Spasme des muscles intercostaux et du diaphragme. Classique du terrain spasmophile.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Spasmophile"
  },
  {
    id: "terrain_spasmo_hyperventilation",
    question: "Avez-vous des épisodes d'essoufflement avec picotements des doigts/lèvres ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Crise tétaniforme par alcalose respiratoire (hyperventilation).",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Spasmophile"
  },
  {
    id: "terrain_spasmo_sensibilite_bruit",
    question: "Êtes-vous hypersensible aux bruits (sursaut, irritation) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hyperexcitabilité du système nerveux central par déficit magnésien.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Spasmophile"
  },

  // ==========================================
  // 2. TERRAIN CONGESTIF HÉPATO-SPLANCHNIQUE
  // ==========================================
  {
    id: "terrain_congestif_jambes_lourdes",
    question: "Avez-vous les jambes lourdes, surtout en fin de journée ou par temps chaud ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Stase veineuse des membres inférieurs, reflet de la congestion portale.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Congestif"
  },
  {
    id: "terrain_congestif_hemoroides",
    question: "Souffrez-vous d'hémorroïdes ou de varices ?",
    type: "boolean",
    tooltip: "Signe direct d'hypertension portale relative et de faiblesse veineuse.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Congestif"
  },
  {
    id: "terrain_congestif_cephalees_digestives",
    question: "Avez-vous des maux de tête après les repas riches ou l'alcool ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Céphalées hépato-digestives par surcharge métabolique.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Congestif"
  },
  {
    id: "terrain_congestif_langue_chargee",
    question: "Votre langue est-elle souvent chargée (blanche ou jaune) le matin ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Marqueur de surcharge toxémique et de stase hépatobiliaire.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Congestif"
  },
  {
    id: "terrain_congestif_teint_brouille",
    question: "Avez-vous le teint brouillé, jaunâtre ou des cernes marqués ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de mauvaise élimination hépatique et de surcharge lymphatique.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Congestif"
  },

  // ==========================================
  // 3. TERRAIN MÉTABOLIQUE (Syndrome X)
  // ==========================================
  {
    id: "terrain_metabo_graisse_abdominale",
    question: "Prenez-vous facilement du poids au niveau abdominal ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Graisse viscérale = marqueur d'insulino-résistance et d'inflammation.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Métabolique"
  },
  {
    id: "terrain_metabo_sucre_envie",
    question: "Avez-vous des envies irrépressibles de sucré (surtout fin d'après-midi) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de dysglycémie et de dépendance au glucose.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Métabolique"
  },
  {
    id: "terrain_metabo_soif_urines",
    question: "Avez-vous soif en permanence avec des urines fréquentes et abondantes ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Polyurie-polydipsie : penser au pré-diabète ou au diabète.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Métabolique"
  },
  {
    id: "terrain_metabo_acanthosis",
    question: "Avez-vous des zones de peau foncée au cou, aisselles ou plis (Acanthosis nigricans) ?",
    type: "boolean",
    tooltip: "Marqueur cutané pathognomonique de l'insulino-résistance.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Métabolique"
  },
  {
    id: "terrain_metabo_glycemie_elevee",
    question: "A-t-on déjà trouvé que votre glycémie était limite ou élevée ?",
    type: "boolean",
    tooltip: "Antécédent de pré-diabète ou diabète gestationnel à explorer.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Métabolique"
  },

  // ==========================================
  // 4. TERRAIN ATOPIQUE COMPLÉMENTAIRE
  // ==========================================
  {
    id: "terrain_atopique_asthme",
    question: "Avez-vous ou avez-vous eu de l'asthme (même dans l'enfance) ?",
    type: "boolean",
    tooltip: "Marqueur majeur de terrain atopique Th2.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Atopique"
  },
  {
    id: "terrain_atopique_antecedents_familiaux",
    question: "Y a-t-il des allergies, eczéma ou asthme dans votre famille proche ?",
    type: "boolean",
    tooltip: "Le terrain atopique est souvent héréditaire (gènes Th2).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Atopique"
  },
  {
    id: "terrain_atopique_reactif_chimique",
    question: "Êtes-vous sensible aux parfums, produits ménagers, polluants ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Sensibilité chimique multiple (MCS) souvent liée au terrain atopique.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Atopique"
  },
  {
    id: "terrain_atopique_yeux_prurigineux",
    question: "Avez-vous souvent les yeux qui grattent, larmoient ou rougissent ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Conjonctivite allergique récurrente.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Atopique"
  },

  // ==========================================
  // 5. TERRAIN AUTO-IMMUN COMPLÉMENTAIRE
  // ==========================================
  {
    id: "terrain_autoimmun_atcd_familiaux",
    question: "Y a-t-il des maladies auto-immunes dans votre famille (Thyroïdite, PR, SEP, Crohn...) ?",
    type: "boolean",
    tooltip: "Prédisposition génétique aux maladies auto-immunes.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Auto-immun"
  },
  {
    id: "terrain_autoimmun_secheresse_yeux_bouche",
    question: "Avez-vous les yeux et/ou la bouche anormalement secs (syndrome sec) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Peut évoquer un syndrome de Gougerot-Sjögren (auto-immunité exocrine).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Auto-immun"
  },
  {
    id: "terrain_autoimmun_raideur_matinale",
    question: "Avez-vous une raideur articulaire matinale > 30 minutes qui s'améliore dans la journée ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe cardinal d'inflammation articulaire auto-immune (PAR, SpA).",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Auto-immun"
  },
  {
    id: "terrain_autoimmun_ulceres_buccaux",
    question: "Faites-vous régulièrement des aphtes ou ulcères buccaux ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Les aphtes récurrents peuvent signaler une maladie de Behçet ou une auto-immunité.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Auto-immun"
  },
  {
    id: "terrain_autoimmun_photosensibilite",
    question: "Êtes-vous particulièrement sensible au soleil (éruptions, fatigue) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La photosensibilité peut être un signe de lupus ou d'autres connectivites.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Auto-immun"
  },

  // ==========================================
  // 6. TERRAIN DÉGÉNÉRATIF / VIEILLISSEMENT
  // ==========================================
  {
    id: "terrain_degeneratif_memoire",
    question: "Avez-vous noté une baisse de mémoire ou de concentration ces dernières années ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Déclin cognitif pouvant signaler un vieillissement accéléré ou une inflammation.",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Dégénératif"
  },
  {
    id: "terrain_degeneratif_peau_relachement",
    question: "Votre peau a-t-elle perdu de son élasticité (rides précoces, relâchement) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe de dégradation du collagène et de stress oxydatif.",
    weight: 1,
    scoreDirection: "hyper",
    section: "Terrain Dégénératif"
  },
  {
    id: "terrain_degeneratif_douleurs_articulaires_usure",
    question: "Avez-vous des douleurs articulaires qui s'aggravent avec l'effort (genou, hanche, dos) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Arthrose = douleur mécanique par usure (≠ inflammatoire qui empire au repos).",
    weight: 2,
    scoreDirection: "hyper",
    section: "Terrain Dégénératif"
  },
  {
    id: "terrain_degeneratif_osteoporose_fractures",
    question: "A-t-on diagnostiqué une ostéopénie/ostéoporose ou avez-vous eu des fractures spontanées ?",
    type: "boolean",
    tooltip: "Fragilité osseuse = déséquilibre ostéoblastes/ostéoclastes.",
    weight: 3,
    scoreDirection: "hyper",
    section: "Terrain Dégénératif"
  }
];

export default TerrainsPathologiquesConfig;
