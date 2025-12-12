// ═══════════════════════════════════════════════════════════════════════════════
// MUST_FORMS - FORMES GALÉNIQUES NON NÉGOCIABLES
// ═══════════════════════════════════════════════════════════════════════════════
//
// Ce module définit les plantes dont la forme galénique est OBLIGATOIRE
// (action unique aux tissus embryonnaires ou chémotype spécifique)
//
// Sources : Volumes 1-4 Endobiogénie + Grand Livre Gemmothérapie
// Audit complet avec NotebookLM
//
// LÉGENDE :
// - ABSOLUTE = Jamais convertible, action unique
// - STRONG = Très fortement recommandé, alternative dégradée
// ═══════════════════════════════════════════════════════════════════════════════

// Types alignés avec tunisianAdapter.ts
export type MustLevel = 'ABSOLUTE' | 'STRONG';
export type GalenicForm = 'MACERAT_CONCENTRE' | 'HE' | 'EPS' | 'MICROSPHERES' | 'EPF';

export interface MustForm {
  nom_francais: string;
  forme: GalenicForm;
  level: MustLevel;
  axes: string[];
  action_principale: string;
  raison_must: string;
  chemotype?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAPPING ID: MUST_FORMS → TUNISIA_DB
// ═══════════════════════════════════════════════════════════════════════════════

export const MUST_TO_TUNISIA_MAPPING: Record<string, string> = {
  // Bourgeons - IDs différents
  'sequoia_gigantea': 'sequoiadendron',
  'quercus_pedunculata': 'quercus_robur',
  'abies_pectinata': 'abies_alba',
  'crataegus_oxyacantha': 'crataegus_laevigata',
  'vaccinium_vitis_idaea': 'vaccinum_vitis_idaea',
  'olea_europaea': 'olea_europea',

  // HE - IDs différents
  'thymus_vulgaris_phenol': 'thym_thymol',
  'matricaria_recutita_he': 'chamomilla_matricaria_recutita',
  'syzygium_aromaticum': 'girofle',
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🌿 BOURGEONS ABSOLUTE - Action tissus embryonnaires IRREMPLAÇABLE
// ═══════════════════════════════════════════════════════════════════════════════

export const MUST_BOURGEONS_ABSOLUTE: Record<string, MustForm> = {

  // AXE CORTICOTROPE
  'ribes_nigrum': {
    nom_francais: 'Cassis',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['corticotrope', 'SNA', 'immunité', 'drainage'],
    action_principale: 'Stimulant général du cortex surrénalien - Cortisol-like',
    raison_must: 'Régulateur corticotrope le plus polyvalent. Action adaptogène unique aux tissus embryonnaires.',
  },

  'sequoiadendron': {
    nom_francais: 'Séquoia',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['corticotrope', 'gonadotrope_masculin', 'somatotrope'],
    action_principale: 'Redirige métabolisme cholestérol → androgènes surrénaliens',
    raison_must: 'Détournement métabolique cortisol → androgènes. Revitalisant masculin unique.',
  },

  'quercus_robur': {
    nom_francais: 'Chêne',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['polyendocrinien', 'corticotrope', 'drainage'],
    action_principale: 'Redistributeur polyendocrinien général',
    raison_must: 'Redistribue activité endocrinienne. Soutient glucocorticoïdes.',
  },

  // AXE THYRÉOTROPE
  'viburnum_lantana': {
    nom_francais: 'Viorne Lantane',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['thyréotrope', 'pulmonaire'],
    action_principale: 'Inhibiteur de la TRH (central)',
    raison_must: 'Seul bourgeon avec action Anti-TRH spécifique. Non substituable.',
  },

  // AXE GONADOTROPE
  'rubus_idaeus': {
    nom_francais: 'Framboisier',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['gonadotrope_feminin'],
    action_principale: 'Régulateur hormonal féminin (Œstrogènes + Progestérone)',
    raison_must: 'Double action production + récepteurs hormonaux. Irremplaçable.',
  },

  // AXE SOMATOTROPE
  'abies_alba': {
    nom_francais: 'Sapin Pectiné',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['somatotrope', 'osseux'],
    action_principale: 'Fixation calcium - Métabolisme phosphocalcique',
    raison_must: 'Stimule ostéoblastie, inhibe ostéoclastie. Construction osseuse enfant.',
  },

  // SNA
  'tilia_tomentosa': {
    nom_francais: 'Tilleul',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['SNA', 'sédatif_central'],
    action_principale: 'Sédatif central - Modérateur général du SNC',
    raison_must: 'Action sédative profonde. Sécurité enfants/âgés.',
  },

  'crataegus_laevigata': {
    nom_francais: 'Aubépine',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['SNA', 'cardiaque'],
    action_principale: 'Régulateur neuro-cardiaque #1',
    raison_must: 'Synergie cœur-système nerveux unique aux tissus embryonnaires.',
  },

  // NEURO-INTESTINAL
  'ficus_carica': {
    nom_francais: 'Figuier',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['neuro_intestinal', 'SNA', 'drainage'],
    action_principale: 'Harmoniseur neuro-intestinal #1',
    raison_must: 'Régulateur hypophyse/hypothalamus. Régénérateur muqueuses digestives.',
  },

  // IMMUNITÉ
  'rosa_canina': {
    nom_francais: 'Églantier',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['immunité', 'ORL', 'corticotrope'],
    action_principale: 'Support sympathico-corticotrope - ORL enfant',
    raison_must: 'Drainant amygdales/végétations. Essentiel infections ORL enfant.',
  },

  // AUTRES
  'corylus_avellana': {
    nom_francais: 'Noisetier',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['SNA', 'pulmonaire', 'lymphatique'],
    action_principale: 'Régulateur psycho-neuro-cardiaque',
    raison_must: 'Action sur locus coeruleus. Draineur pulmonaire.',
  },

  'cornus_sanguinea': {
    nom_francais: 'Cornouiller Sanguin',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['cardiovasculaire', 'thyréotrope'],
    action_principale: 'Action polyvalente cœur/sang - Antagoniste TSH',
    raison_must: 'Récupération post-infarctus. Moelle osseuse post-chimio.',
  },

  'alnus_glutinosa': {
    nom_francais: 'Aulne Glutineux',
    forme: 'MACERAT_CONCENTRE',
    level: 'ABSOLUTE',
    axes: ['vasculaire', 'cérébral', 'urinaire'],
    action_principale: 'Anti-inflammatoire vasculaire et cérébral',
    raison_must: 'Tropisme vasculaire marqué. Circulation cérébrale.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🌿 BOURGEONS STRONG - Très fortement recommandé
// ═══════════════════════════════════════════════════════════════════════════════

export const MUST_BOURGEONS_STRONG: Record<string, MustForm> = {

  'vaccinum_vitis_idaea': {
    nom_francais: 'Airelle',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['gonadotrope_feminin', 'somatotrope', 'urinaire'],
    action_principale: 'Antivieillissement féminin - Œstrogène-like',
    raison_must: 'Régulateur hormonal féminin, ménopause.',
  },

  'zea_mays': {
    nom_francais: 'Maïs (Radicelles)',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['thyréotrope', 'drainage'],
    action_principale: 'Antagoniste TSH - Draineur hépato-cérébral',
    raison_must: 'Réduit TSH sérique. Drainage terrain toxémique.',
  },

  'rubus_fruticosus': {
    nom_francais: 'Ronce',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['somatotrope', 'osseux'],
    action_principale: 'Stimule ostéoblastes - Régénérant tissulaire',
    raison_must: 'Construction osseuse, ostéoporose.',
  },

  'prunus_amygdalus': {
    nom_francais: 'Amandier',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['somatotrope', 'thyréotrope'],
    action_principale: 'Régulateur métabolisme lipidique',
    raison_must: 'Stimulant thyroïdien, régulateur triglycérides.',
  },

  'juglans_regia': {
    nom_francais: 'Noyer',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['drainage', 'immunité', 'somatotrope'],
    action_principale: 'Régulateur flore intestinale - Antifongique',
    raison_must: 'Équilibrage flore (dysbiose, Candida).',
  },

  'betula_pubescens': {
    nom_francais: 'Bouleau Pubescent',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['drainage', 'osseux'],
    action_principale: 'Draineur hépato-rénal profond - Reminéralisant',
    raison_must: 'Drainage profond. Grand nettoyage terrain.',
  },

  'juniperus_communis': {
    nom_francais: 'Genévrier',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['drainage', 'rénal'],
    action_principale: 'Draineur hépato-rénal puissant',
    raison_must: 'Activation élimination rénale. Inhibe E. coli.',
  },

  'rosmarinus_officinalis_mg': {
    nom_francais: 'Romarin (bourgeon)',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['drainage', 'hépatique', 'biliaire'],
    action_principale: 'Drainage hépato-biliaire complet',
    raison_must: 'Bourgeon plus complet que HE sur le foie.',
  },

  'vitis_vinifera': {
    nom_francais: 'Vigne',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['immunité', 'articulaire'],
    action_principale: 'Régulateur immunitaire - Anti auto-immun',
    raison_must: 'Anti-inflammatoire articulaire. Limite auto-immunité.',
  },

  'olea_europea': {
    nom_francais: 'Olivier',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['cérébral', 'cardiovasculaire'],
    action_principale: 'Action cérébrale et métabolique',
    raison_must: 'Améliore fonctionnement cérébral, mémoire.',
  },

  'fraxinus_excelsior': {
    nom_francais: 'Frêne',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['rénal', 'corticotrope'],
    action_principale: '"Jumeau du cassis" - Anti-inflammatoire rénal',
    raison_must: 'Stimulant rénal et surrénalien. Élimine acide urique.',
  },

  'sambucus_nigra': {
    nom_francais: 'Sureau',
    forme: 'MACERAT_CONCENTRE',
    level: 'STRONG',
    axes: ['somatotrope', 'lymphatique'],
    action_principale: 'Régulateur prolactine - Diaphorétique',
    raison_must: 'Relance prolactine. Drainage lymphatique.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 💧 HE ABSOLUTE - Chémotype spécifique irremplaçable
// ═══════════════════════════════════════════════════════════════════════════════

export const MUST_HE_ABSOLUTE: Record<string, MustForm> = {

  'lavandula_angustifolia': {
    nom_francais: 'Lavande Vraie',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['SNA', 'immunité', 'corticotrope'],
    action_principale: 'Alpha-sympatholytique - Sédatif GABAergique',
    raison_must: 'Polyvalent sympatholytique. Anxiété, spasmophilies, insomnie.',
    chemotype: 'Linalol + Acétate de linalyle',
  },

  'salvia_sclarea': {
    nom_francais: 'Sauge Sclarée',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['gonadotrope_feminin', 'thyréotrope'],
    action_principale: 'Œstrogène-like puissant (sclaréol)',
    raison_must: 'Régulation complexe gonado-thyréotrope.',
    chemotype: 'Sclaréol (diterpénol)',
  },

  'thym_thymol': {
    nom_francais: 'Thym (ct. Phénols)',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['immunité', 'anti_infectieux'],
    action_principale: 'Antimicrobien majeur à large spectre',
    raison_must: 'Bactéricide, viricide, fongicide. Soutien immuno-surrénalien.',
    chemotype: 'Thymol / Carvacrol (phénols)',
  },

  'satureja_montana': {
    nom_francais: 'Sarriette des Montagnes',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['immunité', 'corticotrope', 'SNA'],
    action_principale: 'Anti-infectieuse puissante - Stimulant cortex surrénalien',
    raison_must: 'Phénols concentrés. Cas avancés asthénie.',
    chemotype: 'Carvacrol (phénol dominant)',
  },

  'cinnamomum_verum': {
    nom_francais: 'Cannelle de Ceylan',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['immunité', 'SNA', 'digestif'],
    action_principale: 'Anti-infectieuse majeure - Bêta-sympathomimétique',
    raison_must: 'Bactéricide, fongicide, viricide. Relance adrénaline.',
    chemotype: 'Cinnamaldéhyde (aldéhyde aromatique)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 💧 HE STRONG - Très fortement recommandé
// ═══════════════════════════════════════════════════════════════════════════════

export const MUST_HE_STRONG: Record<string, MustForm> = {

  'picea_mariana': {
    nom_francais: 'Épinette Noire',
    forme: 'HE',
    level: 'STRONG',
    axes: ['corticotrope', 'immunité'],
    action_principale: 'Cortison-like - Soutien axe hypophyso-cortico-surrénalien',
    raison_must: 'Action cortison-like spécifique. Fatigue.',
    chemotype: 'Acétate de bornyle',
  },

  'pinus_sylvestris': {
    nom_francais: 'Pin Sylvestre',
    forme: 'HE',
    level: 'STRONG',
    axes: ['corticotrope'],
    action_principale: 'Cortison-like - Tonique surrénalien',
    raison_must: 'Tonique relance corticosurrénalienne.',
    chemotype: 'Alpha-pinène, Limonène',
  },

  'melaleuca_alternifolia': {
    nom_francais: 'Tea Tree',
    forme: 'HE',
    level: 'STRONG',
    axes: ['immunité', 'anti_infectieux'],
    action_principale: 'Anti-infectieuse majeure - Immunostimulant',
    raison_must: 'Staphylocoques et candidas. Large spectre.',
    chemotype: 'Terpinène-4-ol',
  },

  'chamomilla_matricaria_recutita': {
    nom_francais: 'Camomille Allemande',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA', 'corticotrope'],
    action_principale: 'Alpha-sympatholytique - Réduit ACTH',
    raison_must: 'Modérateur sans sédation excessive.',
    chemotype: 'Chamazulène',
  },

  'artemisia_dracunculus': {
    nom_francais: 'Estragon',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA'],
    action_principale: 'Alpha-sympatholytique - Spasmolytique majeur',
    raison_must: 'Antispasmodique puissant. Spasmophilies.',
    chemotype: 'Estragole (méthyl-chavicol)',
  },

  'girofle': {
    nom_francais: 'Clou de Girofle',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA', 'anti_infectieux'],
    action_principale: 'Bêta-sympathomimétique - Parasympatholytique',
    raison_must: 'Vasoconstricteur puissant. Anti-infectieux dentaire.',
    chemotype: 'Eugénol (phénol)',
  },

  'mentha_piperita': {
    nom_francais: 'Menthe Poivrée',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA', 'digestif'],
    action_principale: 'Parasympatholytique - Antalgique central',
    raison_must: 'Vasoconstricteur rapide. Tonique digestif.',
    chemotype: 'Menthol + Menthone',
  },

  'pimpinella_anisum': {
    nom_francais: 'Anis Vert',
    forme: 'HE',
    level: 'STRONG',
    axes: ['gonadotrope_feminin'],
    action_principale: 'Œstrogène-like - Galactogène',
    raison_must: 'Action œstrogène-like puissante.',
    chemotype: 'Trans-anéthole',
  },

  'angelica_archangelica': {
    nom_francais: 'Angélique',
    forme: 'HE',
    level: 'STRONG',
    axes: ['gonadotrope_feminin', 'thyréotrope'],
    action_principale: 'Utéro-tonique - Œstrogène-like',
    raison_must: 'Régulateur gonado-thyréotrope. Dysménorrhée.',
    chemotype: 'Impératorine, Bergaptène (coumarines)',
  },

  'eucalyptus_radiata': {
    nom_francais: 'Eucalyptus Radié',
    forme: 'HE',
    level: 'STRONG',
    axes: ['pulmonaire', 'immunité'],
    action_principale: 'Décongestionnant pulmonaire - Antiviral',
    raison_must: 'Inhalation efficace. Sécurité enfants.',
    chemotype: '1,8-cinéole (eucalyptol)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalise un ID pour la recherche MUST
 */
function normalizeMustId(id: string): string {
  // Mapper vers TUNISIA_DB si nécessaire
  const mappedId = MUST_TO_TUNISIA_MAPPING[id];
  if (mappedId) return mappedId;

  // Nettoyer l'ID
  return id
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-\s]+/g, "_")
    .replace(/[^a-z_]/g, "");
}

/**
 * Vérifie si une plante a une forme MUST
 */
export function isMustForm(plantKey: string): boolean {
  const normalizedKey = normalizeMustId(plantKey);
  return (
    normalizedKey in MUST_BOURGEONS_ABSOLUTE ||
    normalizedKey in MUST_BOURGEONS_STRONG ||
    normalizedKey in MUST_HE_ABSOLUTE ||
    normalizedKey in MUST_HE_STRONG
  );
}

/**
 * Retourne la forme MUST pour une plante
 */
export function getMustForm(plantKey: string): MustForm | null {
  const normalizedKey = normalizeMustId(plantKey);
  return (
    MUST_BOURGEONS_ABSOLUTE[normalizedKey] ||
    MUST_BOURGEONS_STRONG[normalizedKey] ||
    MUST_HE_ABSOLUTE[normalizedKey] ||
    MUST_HE_STRONG[normalizedKey] ||
    null
  );
}

/**
 * Vérifie si une conversion est autorisée
 */
export function isConversionAllowed(plantKey: string, targetForm: GalenicForm): boolean {
  const must = getMustForm(plantKey);
  if (!must) return true;

  if (must.level === 'ABSOLUTE') {
    return must.forme === targetForm;
  }

  // STRONG : conversion déconseillée mais possible
  return true;
}

/**
 * Retourne un avertissement si conversion problématique
 */
export function getConversionWarning(
  plantKey: string,
  targetForm: GalenicForm
): { level: 'CRITICAL' | 'WARNING' | null; message: string | null } {
  const must = getMustForm(plantKey);
  if (!must || must.forme === targetForm) {
    return { level: null, message: null };
  }

  if (must.level === 'ABSOLUTE') {
    return {
      level: 'CRITICAL',
      message: `⛔ FORME OBLIGATOIRE: ${must.nom_francais} DOIT être en ${must.forme}. ` +
        `Raison: ${must.action_principale}. Conversion INTERDITE.`
    };
  }

  if (must.level === 'STRONG') {
    return {
      level: 'WARNING',
      message: `⚠️ FORME RECOMMANDÉE: ${must.nom_francais} préférable en ${must.forme}. ` +
        `${must.raison_must}`
    };
  }

  return { level: null, message: null };
}

/**
 * Liste toutes les plantes MUST par axe
 */
export function getMustByAxe(axe: string): MustForm[] {
  const allMust = {
    ...MUST_BOURGEONS_ABSOLUTE,
    ...MUST_BOURGEONS_STRONG,
    ...MUST_HE_ABSOLUTE,
    ...MUST_HE_STRONG
  };

  return Object.values(allMust).filter(m => m.axes.includes(axe));
}

/**
 * Liste des bourgeons ABSOLUTE (pour le SYSTEM_PROMPT)
 */
export function getAbsoluteBourgeonsList(): string[] {
  return Object.values(MUST_BOURGEONS_ABSOLUTE).map(m =>
    `${m.nom_francais} - ${m.action_principale}`
  );
}

/**
 * Liste des HE ABSOLUTE (pour le SYSTEM_PROMPT)
 */
export function getAbsoluteHEList(): string[] {
  return Object.values(MUST_HE_ABSOLUTE).map(m =>
    `${m.nom_francais} (${m.chemotype || ''}) - ${m.action_principale}`
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  MUST_BOURGEONS_ABSOLUTE,
  MUST_BOURGEONS_STRONG,
  MUST_HE_ABSOLUTE,
  MUST_HE_STRONG,
  MUST_TO_TUNISIA_MAPPING,
  isMustForm,
  getMustForm,
  isConversionAllowed,
  getConversionWarning,
  getMustByAxe,
  getAbsoluteBourgeonsList,
  getAbsoluteHEList,
};
