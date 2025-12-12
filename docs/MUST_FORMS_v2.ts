// ═══════════════════════════════════════════════════════════════════════════════
// MUST_FORMS v2.0 - FORMES GALÉNIQUES NON NÉGOCIABLES
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Fichier consolidé après audit complet des 7 axes avec NotebookLM
// Sources : Volumes 1-4 Endobiogénie + Grand Livre Gemmothérapie
//
// LÉGENDE :
// - ABSOLUTE = Jamais convertible, action unique aux tissus embryonnaires/chémotype
// - STRONG = Très fortement recommandé, alternative existe mais dégradée
//
// ⚠️ Ces règles sont UNIVERSELLES (pas des préférences médecin)
// ═══════════════════════════════════════════════════════════════════════════════

export type MustLevel = 'ABSOLUTE' | 'STRONG';
export type GalenicForm = 'MACERAT_BOURGEON' | 'HE' | 'JEUNES_POUSSES';

export interface MustForm {
  nom_francais: string;
  forme: GalenicForm;
  level: MustLevel;
  axes: string[];
  action_principale: string;
  raison_must: string;
  chemotype?: string;  // Pour les HE uniquement
  source_audit: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌿 BOURGEONS (MACÉRATS GLYCÉRINÉS) - ABSOLUTE
// ═══════════════════════════════════════════════════════════════════════════════
// Action sur tissus embryonnaires = IRREMPLAÇABLE

export const MUST_BOURGEONS_ABSOLUTE: Record<string, MustForm> = {

  // ─────────────────────────────────────────────────────────────────────────────
  // AXE CORTICOTROPE
  // ─────────────────────────────────────────────────────────────────────────────
  
  'ribes_nigrum': {
    nom_francais: 'Cassis',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['corticotrope', 'SNA', 'immunité', 'drainage'],
    action_principale: 'Stimulant général du cortex surrénalien - Cortisol-like',
    raison_must: `Régulateur corticotrope le plus polyvalent. "Draineur vrai" avec action 
      adaptogène unique. Soutien périphérique corticotrope irremplaçable.
      Immunomodulateur et anti-allergique.`,
    source_audit: 'Corticotrope, Drainage, Immunité'
  },

  'sequoia_gigantea': {
    nom_francais: 'Séquoia',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['corticotrope', 'gonadotrope_masculin', 'somatotrope'],
    action_principale: 'Redirige métabolisme cholestérol → androgènes surrénaliens',
    raison_must: `Action spécifique de détournement métabolique du cortisol vers les 
      androgènes. Revitalisant masculin, reminéralisant osseux, régénération 
      post-catabolisme. Anti-vieillissement.`,
    source_audit: 'Corticotrope, Gonadotrope, Somatotrope'
  },

  'quercus_pedunculata': {
    nom_francais: 'Chêne',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['polyendocrinien', 'corticotrope', 'drainage'],
    action_principale: 'Redistributeur polyendocrinien général',
    raison_must: `Redistribue l'activité endocrinienne, soutient production glucocorticoïdes.
      Adaptogène pour insuffisance surrénalienne. Relance fonction d'élimination 
      de tous les émonctoires.`,
    source_audit: 'Corticotrope, Drainage'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AXE THYRÉOTROPE
  // ─────────────────────────────────────────────────────────────────────────────

  'viburnum_lantana': {
    nom_francais: 'Viorne Lantane',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['thyréotrope', 'pulmonaire'],
    action_principale: 'Inhibiteur de la TRH (central)',
    raison_must: `Seul bourgeon avec action Anti-TRH spécifique. Régulation troubles 
      pulmonaires spasmodiques (asthme). Action centrale non substituable.`,
    source_audit: 'Thyréotrope'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AXE GONADOTROPE
  // ─────────────────────────────────────────────────────────────────────────────

  'rubus_idaeus': {
    nom_francais: 'Framboisier',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['gonadotrope_feminin'],
    action_principale: 'Régulateur hormonal féminin (Œstrogènes + Progestérone)',
    raison_must: `Régulation profonde du cycle menstruel. Action spécifique sur l'hypophyse
      et les récepteurs hormonaux. Double action production + récepteurs unique.`,
    source_audit: 'Gonadotrope'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AXE SOMATOTROPE
  // ─────────────────────────────────────────────────────────────────────────────

  'abies_pectinata': {
    nom_francais: 'Sapin Pectiné',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['somatotrope', 'osseux'],
    action_principale: 'Fixation calcium - Métabolisme phosphocalcique',
    raison_must: `Stimule ostéoblastie, inhibe ostéoclastie. Action ciblée et spécifique
      sur la construction osseuse chez l'enfant. Croissance.`,
    source_audit: 'Somatotrope'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SYSTÈME NERVEUX AUTONOME (SNA)
  // ─────────────────────────────────────────────────────────────────────────────

  'tilia_tomentosa': {
    nom_francais: 'Tilleul',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['SNA', 'sédatif_central'],
    action_principale: 'Sédatif central - Modérateur général du SNC',
    raison_must: `Action sédative profonde sur système nerveux central. Sommeil, anxiété,
      agitation. Régulation parasympathique. Sécurité enfants/âgés.`,
    source_audit: 'SNA'
  },

  'crataegus_oxyacantha': {
    nom_francais: 'Aubépine',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['SNA', 'cardiaque'],
    action_principale: 'Régulateur neuro-cardiaque #1',
    raison_must: `Adaptogène bêta, régulateur rythmique et tensionnel. Synergie 
      cœur-système nerveux unique aux tissus embryonnaires. Alpha-sympatholytique.`,
    source_audit: 'SNA'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NEURO-INTESTINAL / DRAINAGE
  // ─────────────────────────────────────────────────────────────────────────────

  'ficus_carica': {
    nom_francais: 'Figuier',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['neuro_intestinal', 'SNA', 'drainage'],
    action_principale: 'Harmoniseur neuro-intestinal #1',
    raison_must: `Régulateur hypophyse/hypothalamus. Régénérateur muqueuses digestives
      (ulcères, gastrites). Action substitutive impossible avec TM.
      Modulateur neurotransmetteurs (sérotonine).`,
    source_audit: 'Somatotrope, Drainage'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // IMMUNITÉ
  // ─────────────────────────────────────────────────────────────────────────────

  'rosa_canina': {
    nom_francais: 'Églantier',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['immunité', 'ORL', 'corticotrope'],
    action_principale: 'Support sympathico-corticotrope - ORL enfant',
    raison_must: `Drainant amygdales/végétations adénoïdes. Essentiel dans infections
      ORL récurrentes chez l'enfant. Action immunostimulante spécifique.`,
    source_audit: 'Immunité'
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTRES BOURGEONS ABSOLUTE (liste initiale confirmée)
  // ─────────────────────────────────────────────────────────────────────────────

  'corylus_avellana': {
    nom_francais: 'Noisetier',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['SNA', 'pulmonaire', 'lymphatique'],
    action_principale: 'Régulateur psycho-neuro-cardiaque',
    raison_must: `Stabilise réponse adaptation via système limbique. Action sur 
      locus coeruleus. Draineur pulmonaire, régénérant tissus sclérosés.`,
    source_audit: 'Thyréotrope (confirmation)'
  },

  'cornus_sanguinea': {
    nom_francais: 'Cornouiller Sanguin',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['cardiovasculaire', 'thyréotrope'],
    action_principale: 'Action polyvalente cœur/sang - Antagoniste TSH',
    raison_must: `Récupération post-infarctus. Moelle osseuse post-chimio.
      Action sur TSH périphérique.`,
    source_audit: 'Corticotrope (initial)'
  },

  'alnus_glutinosa': {
    nom_francais: 'Aulne Glutineux',
    forme: 'MACERAT_BOURGEON',
    level: 'ABSOLUTE',
    axes: ['vasculaire', 'cérébral', 'urinaire'],
    action_principale: 'Anti-inflammatoire vasculaire et cérébral',
    raison_must: `Tropisme vasculaire marqué. Circulation cérébrale.
      Bactériostatique urinaire. Troubles inflammatoires chroniques.`,
    source_audit: 'Liste initiale'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🌿 BOURGEONS - STRONG (Très fortement recommandé)
// ═══════════════════════════════════════════════════════════════════════════════

export const MUST_BOURGEONS_STRONG: Record<string, MustForm> = {

  'vaccinium_vitis_idaea': {
    nom_francais: 'Airelle',
    forme: 'JEUNES_POUSSES',
    level: 'STRONG',
    axes: ['gonadotrope_feminin', 'somatotrope', 'urinaire'],
    action_principale: 'Antivieillissement féminin - Œstrogène-like',
    raison_must: `Régulateur hormonal féminin, ménopause. Assimilation calcium intestinal.
      Jeunes pousses (pas bourgeon strict) pour action hormonale et rénale.`,
    source_audit: 'Gonadotrope, Somatotrope'
  },

  'zea_mays': {
    nom_francais: 'Maïs (Radicelles)',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['thyréotrope', 'drainage'],
    action_principale: 'Antagoniste TSH - Draineur hépato-cérébral',
    raison_must: `Réduit TSH sérique. Drainage terrain toxémique (fibromyalgie).
      Action Anti-TSH indirecte et anti-inflammatoire.`,
    source_audit: 'Thyréotrope, Drainage'
  },

  'rubus_fruticosus': {
    nom_francais: 'Ronce',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['somatotrope', 'osseux'],
    action_principale: 'Stimule ostéoblastes - Régénérant tissulaire profond',
    raison_must: `Construction osseuse, ostéoporose. Régénérant des tissus très abîmés
      et sclérosés.`,
    source_audit: 'Somatotrope'
  },

  'prunus_amygdalus': {
    nom_francais: 'Amandier',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['somatotrope', 'thyréotrope'],
    action_principale: 'Régulateur métabolisme lipidique',
    raison_must: `Stimulant thyroïdien, régulateur triglycérides et graisses.
      Métabolisme lipidique sollicité par axe somatotrope.`,
    source_audit: 'Somatotrope'
  },

  'juglans_regia': {
    nom_francais: 'Noyer',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['drainage', 'immunité', 'somatotrope'],
    action_principale: 'Régulateur flore intestinale - Antifongique',
    raison_must: `Équilibrage flore (dysbiose, Candida, parasites). Action pancréas
      exocrine. Astringent intestinal.`,
    source_audit: 'Somatotrope, Drainage, Immunité'
  },

  'betula_pubescens': {
    nom_francais: 'Bouleau Pubescent',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['drainage', 'osseux'],
    action_principale: 'Draineur hépato-rénal profond - Reminéralisant',
    raison_must: `Drainage profond et reminéralisant. Active rein, peau, lymphe.
      "Grand nettoyage" du terrain. Revitalisation.`,
    source_audit: 'Drainage'
  },

  'secale_cereale': {
    nom_francais: 'Seigle (Radicelles)',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['drainage', 'hépatique', 'cutané'],
    action_principale: 'Régénérant hépatique et cutané',
    raison_must: `Réparation tissulaire du foie après agression. Désordres
      dermatologiques profonds. Régénérant cellulaire.`,
    source_audit: 'Drainage'
  },

  'juniperus_communis': {
    nom_francais: 'Genévrier',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['drainage', 'rénal'],
    action_principale: 'Draineur hépato-rénal puissant',
    raison_must: `Activation intense élimination rénale. Inhibe E. coli (cystites).
      Action drainante profonde préférable en bourgeon.`,
    source_audit: 'Liste initiale'
  },

  'rosmarinus_officinalis': {
    nom_francais: 'Romarin',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['drainage', 'hépatique', 'biliaire'],
    action_principale: 'Drainage hépato-biliaire complet',
    raison_must: `Stimule production et évacuation bile. Détoxifiant hépatique.
      Bourgeon plus complet que HE sur le foie.`,
    source_audit: 'Liste initiale'
  },

  'vitis_vinifera': {
    nom_francais: 'Vigne',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['immunité', 'articulaire'],
    action_principale: 'Régulateur immunitaire - Anti auto-immun',
    raison_must: `Anti-inflammatoire digestif et articulaire. Limite réactions
      auto-immunes. Réduit ostéophytes.`,
    source_audit: 'Liste initiale'
  },

  'olea_europaea': {
    nom_francais: 'Olivier',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['cérébral', 'cardiovasculaire'],
    action_principale: 'Action cérébrale et métabolique',
    raison_must: `Améliore fonctionnement cérébral, mémoire, phobies.
      Hypotenseur, hypoglycémiant. Tropisme cérébral du bourgeon.`,
    source_audit: 'Liste initiale'
  },

  'fraxinus_excelsior': {
    nom_francais: 'Frêne',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['rénal', 'corticotrope'],
    action_principale: '"Jumeau du cassis" - Anti-inflammatoire rénal',
    raison_must: `Stimulant rénal et surrénalien. Élimine acide urique.
      Anti-inflammatoire par voie surrénalienne.`,
    source_audit: 'Liste initiale'
  },

  'sambucus_nigra': {
    nom_francais: 'Sureau',
    forme: 'MACERAT_BOURGEON',
    level: 'STRONG',
    axes: ['somatotrope', 'lymphatique'],
    action_principale: 'Régulateur prolactine - Diaphorétique',
    raison_must: `Relance prolactine. Sudorifique (fièvre). Drainage lymphatique.
      Action sur prolactine plus spécifique en bourgeon.`,
    source_audit: 'Liste initiale'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 💧 HUILES ESSENTIELLES - ABSOLUTE
// ═══════════════════════════════════════════════════════════════════════════════
// Chémotype spécifique = action unique

export const MUST_HE_ABSOLUTE: Record<string, MustForm> = {

  'lavandula_angustifolia': {
    nom_francais: 'Lavande Vraie',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['SNA', 'immunité', 'corticotrope'],
    action_principale: 'Alpha-sympatholytique - Sédatif GABAergique',
    raison_must: `Polyvalent sympatholytique. Anxiété, spasmophilies, insomnie.
      Immunomodulateur (antiallergique). Application topique/olfactive rapide.`,
    chemotype: 'Linalol + Acétate de linalyle',
    source_audit: 'SNA, Immunité'
  },

  'salvia_sclarea': {
    nom_francais: 'Sauge Sclarée',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['gonadotrope_feminin', 'thyréotrope'],
    action_principale: 'Œstrogène-like puissant (sclaréol)',
    raison_must: `Régulation complexe gonado-thyréotrope. Antispasmodique menstruation.
      Action sur sclaréol unique. Application topique ciblée.`,
    chemotype: 'Sclaréol (diterpénol)',
    source_audit: 'Gonadotrope, Thyréotrope'
  },

  'thymus_vulgaris_phenol': {
    nom_francais: 'Thym (ct. Phénols)',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['immunité', 'anti_infectieux'],
    action_principale: 'Antimicrobien majeur à large spectre',
    raison_must: `Bactéricide, viricide, fongicide, antiparasitaire. Soutien immuno-
      surrénalien. Forme concentrée requise pour efficacité maximale.`,
    chemotype: 'Thymol / Carvacrol (phénols)',
    source_audit: 'Corticotrope, Immunité'
  },

  'satureja_montana': {
    nom_francais: 'Sarriette des Montagnes',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['immunité', 'corticotrope', 'SNA'],
    action_principale: 'Anti-infectieuse puissante - Stimulant cortex surrénalien',
    raison_must: `Phénols concentrés pour action antimicrobienne. Tonique général.
      Cas avancés d'asthénie et insuffisance surrénale.`,
    chemotype: 'Carvacrol (phénol dominant)',
    source_audit: 'Corticotrope, Immunité'
  },

  'cinnamomum_verum': {
    nom_francais: 'Cannelle de Ceylan',
    forme: 'HE',
    level: 'ABSOLUTE',
    axes: ['immunité', 'SNA', 'digestif'],
    action_principale: 'Anti-infectieuse majeure - Bêta-sympathomimétique',
    raison_must: `Bactéricide, fongicide, viricide. Infections digestives et urinaires.
      Relance adrénaline (bêta). Aldéhyde aromatique concentré.`,
    chemotype: 'Cinnamaldéhyde (aldéhyde aromatique)',
    source_audit: 'SNA, Immunité'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 💧 HUILES ESSENTIELLES - STRONG
// ═══════════════════════════════════════════════════════════════════════════════

export const MUST_HE_STRONG: Record<string, MustForm> = {

  'picea_mariana': {
    nom_francais: 'Épinette Noire',
    forme: 'HE',
    level: 'STRONG',
    axes: ['corticotrope', 'immunité'],
    action_principale: 'Cortison-like - Soutien axe hypophyso-cortico-surrénalien',
    raison_must: `Action cortison-like spécifique. Fatigue, "coups de pompe".
      Soutien surrénalien pour l'immunité.`,
    chemotype: 'Acétate de bornyle (ester terpénique)',
    source_audit: 'Corticotrope, Immunité'
  },

  'pinus_sylvestris': {
    nom_francais: 'Pin Sylvestre',
    forme: 'HE',
    level: 'STRONG',
    axes: ['corticotrope'],
    action_principale: 'Cortison-like - Tonique surrénalien',
    raison_must: `Action sur axe hypophyso-cortico-surrénalien. Tonique et stimulant
      pour relance corticosurrénalienne.`,
    chemotype: 'Alpha-pinène, Limonène',
    source_audit: 'Corticotrope'
  },

  'melaleuca_alternifolia': {
    nom_francais: 'Tea Tree',
    forme: 'HE',
    level: 'STRONG',
    axes: ['immunité', 'anti_infectieux'],
    action_principale: 'Anti-infectieuse majeure - Immunostimulant',
    raison_must: `Action sur staphylocoques et candidas. Large spectre antimicrobien.
      Immunostimulant.`,
    chemotype: 'Terpinène-4-ol (alcool monoterpénique)',
    source_audit: 'Immunité'
  },

  'matricaria_recutita': {
    nom_francais: 'Camomille Allemande',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA', 'corticotrope'],
    action_principale: 'Alpha-sympatholytique - Réduit ACTH',
    raison_must: `Modérateur sans sédation excessive. Inhibition ACTH en cas
      d'hypersensibilité/allergie. Anti-colère.`,
    chemotype: 'Chamazulène (anti-inflammatoire)',
    source_audit: 'Corticotrope, SNA'
  },

  'artemisia_dracunculus': {
    nom_francais: 'Estragon',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA'],
    action_principale: 'Alpha-sympatholytique - Spasmolytique neuromusculaire majeur',
    raison_must: `Antispasmodique puissant. Spasmophilies. Action neuromusculaire.`,
    chemotype: 'Estragole (méthyl-chavicol)',
    source_audit: 'SNA'
  },

  'syzygium_aromaticum': {
    nom_francais: 'Clou de Girofle',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA', 'anti_infectieux'],
    action_principale: 'Bêta-sympathomimétique - Parasympatholytique',
    raison_must: `Vasoconstricteur puissant. Calcium Channel Blocker.
      Anti-infectieux dentaire.`,
    chemotype: 'Eugénol (phénol)',
    source_audit: 'SNA'
  },

  'mentha_piperita': {
    nom_francais: 'Menthe Poivrée',
    forme: 'HE',
    level: 'STRONG',
    axes: ['SNA', 'digestif'],
    action_principale: 'Parasympatholytique - Antalgique central',
    raison_must: `Vasoconstricteur rapide. Régulateur neuro-cardiaque indirect.
      Tonique digestif.`,
    chemotype: 'Menthol + Menthone',
    source_audit: 'SNA'
  },

  'pimpinella_anisum': {
    nom_francais: 'Anis Vert',
    forme: 'HE',
    level: 'STRONG',
    axes: ['gonadotrope_feminin'],
    action_principale: 'Œstrogène-like - Galactogène',
    raison_must: `Action œstrogène-like puissante. Troubles ménopause et cycle.
      Antispasmodique utérin.`,
    chemotype: 'Trans-anéthole',
    source_audit: 'Gonadotrope'
  },

  'angelica_archangelica': {
    nom_francais: 'Angélique',
    forme: 'HE',
    level: 'STRONG',
    axes: ['gonadotrope_feminin', 'thyréotrope'],
    action_principale: 'Utéro-tonique - Œstrogène-like (coumarines)',
    raison_must: `Régulateur gonado-thyréotrope. Dysménorrhée. Antispasmodique pelvien.
      Thyroïdite Hashimoto (couplage).`,
    chemotype: 'Impératorine, Bergaptène (coumarines)',
    source_audit: 'Gonadotrope, Thyréotrope'
  },

  'eucalyptus_radiata': {
    nom_francais: 'Eucalyptus Radié',
    forme: 'HE',
    level: 'STRONG',
    axes: ['pulmonaire', 'immunité'],
    action_principale: 'Décongestionnant pulmonaire - Antiviral',
    raison_must: `HE requise pour inhalation/nébulisation efficace.
      Sécurité enfants (vs E. globulus).`,
    chemotype: '1,8-cinéole (eucalyptol)',
    source_audit: 'Immunité (initial)'
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 STATISTIQUES FINALES
// ═══════════════════════════════════════════════════════════════════════════════
/*
  BOURGEONS ABSOLUTE : 13 plantes
  BOURGEONS STRONG   : 13 plantes
  HE ABSOLUTE        : 5 plantes
  HE STRONG          : 10 plantes
  ─────────────────────────────
  TOTAL MUST         : 41 formes galéniques irremplaçables
*/

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si une plante a une forme MUST (toutes catégories)
 */
export function isMustForm(plantKey: string): boolean {
  return (
    plantKey in MUST_BOURGEONS_ABSOLUTE ||
    plantKey in MUST_BOURGEONS_STRONG ||
    plantKey in MUST_HE_ABSOLUTE ||
    plantKey in MUST_HE_STRONG
  );
}

/**
 * Retourne la forme MUST pour une plante
 */
export function getMustForm(plantKey: string): MustForm | null {
  return (
    MUST_BOURGEONS_ABSOLUTE[plantKey] ||
    MUST_BOURGEONS_STRONG[plantKey] ||
    MUST_HE_ABSOLUTE[plantKey] ||
    MUST_HE_STRONG[plantKey] ||
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
  
  // STRONG : conversion déconseillée mais possible avec avertissement
  return true;
}

/**
 * Retourne un avertissement si conversion problématique
 */
export function getConversionWarning(plantKey: string, targetForm: GalenicForm): string | null {
  const must = getMustForm(plantKey);
  if (!must || must.forme === targetForm) return null;
  
  if (must.level === 'ABSOLUTE') {
    return `⛔ INTERDIT : ${must.nom_francais} DOIT être en ${must.forme}. 
      Raison : ${must.action_principale}`;
  }
  
  if (must.level === 'STRONG') {
    return `⚠️ DÉCONSEILLÉ : ${must.nom_francais} préférable en ${must.forme}. 
      Raison : ${must.raison_must.substring(0, 100)}...`;
  }
  
  return null;
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

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  MUST_BOURGEONS_ABSOLUTE,
  MUST_BOURGEONS_STRONG,
  MUST_HE_ABSOLUTE,
  MUST_HE_STRONG,
  isMustForm,
  getMustForm,
  isConversionAllowed,
  getConversionWarning,
  getMustByAxe,
};
