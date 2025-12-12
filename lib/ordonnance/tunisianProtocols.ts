/**
 * ============================================================================
 * INTEGRIA - PROTOCOLES GALÉNIQUES TUNISIE v1.0
 * ============================================================================
 *
 * Source: Guide Clinique de Prescription - Adaptation Galénique & Protocoles
 * Département Médical & Développement IntegrIA
 *
 * Ce fichier fait AUTORITÉ pour la conversion entre la théorie endobiogénique
 * et la pratique officinale tunisienne.
 * ============================================================================
 */

// =============================================================================
// 1. TYPES FORMES GALÉNIQUES
// =============================================================================

/** Formes galéniques théoriques (livres/formation) */
export type FormeTheorique = 'TM' | 'MG_1DH' | 'EPS' | 'HE';

/** Formes galéniques pratiques (officine Tunisie) */
export type FormePratiqueTunisie =
  | 'MICROSPHERES'        // TM → Gélules 400-600mg
  | 'MACERAT_MERE'        // MG 1DH → Gouttes concentrées
  | 'EPS'                 // Identité
  | 'SOLUTION_ORALE_HE'   // HE fond chronique → Flacon 125ml
  | 'SUPPOSITOIRES_HE'    // HE aigu ORL → Boîte 6-12
  | 'HE_CUTANEE'          // HE locale → Dilution HV
  | 'HE_INHALATION';      // HE respiratoire → Humide/Sèche

/** Voies d'administration aromathérapie */
export type VoieAromatherapie =
  | 'SOLUTION_ORALE'      // Voie 1: Traitement de fond
  | 'SUPPOSITOIRE'        // Voie 2: Urgence ORL/pulmonaire
  | 'CUTANEE'             // Voie 3: Action ciblée locale
  | 'INHALATION';         // Voie 4: Désinfection aérienne

// =============================================================================
// 2. TABLEAU DE SYNTHÈSE RAPIDE (Guide p.1)
// =============================================================================

export const TABLEAU_CONVERSION = {
  TM: {
    formePratique: 'MICROSPHERES' as FormePratiqueTunisie,
    unite: 'Gélule (400-600mg)',
    posologieStandard: '1 à 2 gélules/jour',
    rythme: 'Continu',
    moment: 'Matin ou Soir',
  },
  MG_1DH: {
    formePratique: 'MACERAT_MERE' as FormePratiqueTunisie,
    unite: 'Flacon 10-30ml (Gouttes)',
    posologieStandard: '15 gouttes/jour',
    rythme: '5 jours sur 7',
    moment: 'Matin à jeun',
  },
  EPS: {
    formePratique: 'EPS' as FormePratiqueTunisie,
    unite: 'Flacon 150-180ml',
    posologieStandard: '5 à 10 ml/jour',
    rythme: '5 jours sur 7',
    moment: 'Le Soir (Vespéral)',
  },
  HE_FOND: {
    formePratique: 'SOLUTION_ORALE_HE' as FormePratiqueTunisie,
    unite: 'Flacon 125ml (Seringue)',
    posologieStandard: '2 ml x 2/jour',
    rythme: 'Continu 30 jours',
    moment: 'Au milieu du repas',
  },
  HE_AIGU: {
    formePratique: 'SUPPOSITOIRES_HE' as FormePratiqueTunisie,
    unite: 'Boîte de 6 à 12',
    posologieStandard: '2 à 3/jour',
    rythme: 'Court terme (3-5 jours)',
    moment: 'Matin et soir',
  },
} as const;

// =============================================================================
// 3. PROTOCOLES DÉTAILLÉS PAR FORME (Guide p.2)
// =============================================================================

export const PROTOCOLES = {
  // ─────────────────────────────────────────────────────────────────────────
  // A. MICROSPHÈRES (Gélules) - Remplace la Teinture Mère
  // ─────────────────────────────────────────────────────────────────────────
  microspheres: {
    nom: 'MICROSPHÈRES',
    remplace: 'Teinture Mère (TM)',
    regleConversion: '1 g Microsphères ≈ 10 g TM',
    architecture: '1 à 6 plantes par gélule',
    contenants: ['Gélule 400mg', 'Gélule 600mg'],
    posologie: {
      standard: '1 à 2 gélules/jour',
      leger: '1 gélule/jour',
      intensif: '2 gélules 2x/jour',
    },
    modalites: 'Avec un grand verre d\'eau',
    rythme: 'Continu',
    maxPlantesParGelule: 6,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // B. GEMMOTHÉRAPIE (Bourgeons) - Macérat Mère Concentré
  // ─────────────────────────────────────────────────────────────────────────
  macerat_mere: {
    nom: 'MACÉRAT MÈRE (Concentré)',
    remplace: 'Bourgeon 1DH',
    regleConversion: '10 gouttes 1DH ≈ 1 goutte Mère',
    contenants: ['Flacon 10ml', 'Flacon 15ml', 'Flacon 30ml'],
    posologie: {
      adulte: '15 gouttes/jour',
      enfant: '5-10 gouttes/jour',
      intensif: '15 gouttes matin et soir',
    },
    rythme: '5 jours sur 7 (Pause week-end)',
    moment: 'Le matin à jeun',
    maxBourgeons: 4,
    noteImportante: 'Ne JAMAIS convertir en microsphères les bourgeons MUST',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // C. EPS (Extraits de Plantes Standardisés)
  // ─────────────────────────────────────────────────────────────────────────
  eps: {
    nom: 'EPS',
    indication: 'Traitement de fond et drainage',
    contenants: ['Flacon 150ml', 'Flacon 180ml'],
    posologie: {
      standard: '5 ml/jour',
      intensif: '10 ml/jour',
    },
    rythme: '5 jours sur 7',
    moment: 'Le Soir (Vespéral), dilué dans l\'eau',
    dureeFlacon: '30-36 jours (selon posologie)',
  },
} as const;

// =============================================================================
// 4. AROMATHÉRAPIE - LES 4 VOIES MAJEURES (Guide p.3)
// =============================================================================

export const VOIES_AROMATHERAPIE = {
  // ─────────────────────────────────────────────────────────────────────────
  // VOIE 1: SOLUTION ORALE HE (S.O.HE) - Traitement de fond
  // ─────────────────────────────────────────────────────────────────────────
  SOLUTION_ORALE: {
    nom: 'SOLUTION ORALE HE (S.O.HE)',
    indication: 'Pathologies chroniques, dysbioses, prévention',
    definition: 'Formule magistrale sécurisée par dispersion (Labrafil) dans corps gras',
    formuleType: {
      huileOlive: '100 ml (Véhicule)',
      labrafil: '20 ml (Dispersant)',
      huilesEssentielles: '4g à 8g (Actifs)',
      volumeTotal: '124 ml',
    },
    posologie: {
      standard: '4 ml/jour (2 prises de 2 ml)',
      outil: 'Seringue doseuse ou cuillère graduée',
    },
    dureeFlacon: '30 jours exacts',
    moment: 'Au milieu du repas',
    notePharmacien: 'Ordre de mélange IMPÉRATIF: HE + Labrafil → Émulsion → Huile d\'Olive',
    badge: 'FOND',
    couleur: '#10b981', // emerald-500
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VOIE 2: SUPPOSITOIRE - Urgence ORL & Pulmonaire
  // ─────────────────────────────────────────────────────────────────────────
  SUPPOSITOIRE: {
    nom: 'SUPPOSITOIRE HE',
    indication: 'Bronchite aiguë, Grippe, Angine, Otite, Sinusite',
    interet: 'Bypasse le foie, action directe sur arbre respiratoire via circulation sanguine',
    formule: 'Base Witepsol + Huiles Essentielles',
    dosageHE: '50-100mg HE par suppositoire adulte',
    posologie: {
      adulte: '1 suppositoire matin et soir (voire 3x/j si très aigu)',
      enfant: 'Dosage adapté au poids',
    },
    duree: '3 à 6 jours MAX',
    contenant: 'Boîte de 6 à 12',
    badge: 'AIGU',
    couleur: '#ef4444', // red-500
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VOIE 3: CUTANÉE - Action ciblée locale
  // ─────────────────────────────────────────────────────────────────────────
  CUTANEE: {
    nom: 'VOIE CUTANÉE',
    indication: 'Douleur locale, infection topique, action nerveuse',
    regle: 'TOUJOURS diluer dans une Huile Végétale (HV)',
    dilutions: {
      cosmetique: { pourcentage: '1-3%', usage: 'Soin quotidien, visage' },
      musculaire: { pourcentage: '5-10%', usage: 'Douleurs musculaires/articulaires' },
      therapeutique: { pourcentage: '10-20%', usage: 'Action systémique (plante des pieds, thorax)' },
    },
    huilesVegetales: ['Jojoba', 'Amande douce', 'Noisette', 'Macadamia'],
    zonesApplication: ['Plante des pieds', 'Thorax', 'Plexus solaire', 'Poignets'],
    badge: 'LOCAL',
    couleur: '#f59e0b', // amber-500
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VOIE 4: INHALATION - Désinfection aérienne
  // ─────────────────────────────────────────────────────────────────────────
  INHALATION: {
    nom: 'INHALATION',
    indication: 'Sinusite, Rhinite, encombrement nasal',
    methodes: {
      humide: {
        description: 'Bol d\'eau chaude',
        posologie: '5-10 gouttes',
        duree: '10 minutes',
        frequence: '2-3x/jour',
      },
      seche: {
        description: 'Mouchoir ou stick inhalateur',
        posologie: '2 gouttes',
        frequence: '5-10 fois/jour',
      },
    },
    badge: 'ORL',
    couleur: '#3b82f6', // blue-500
  },
} as const;

// =============================================================================
// 5. CONTRE-INDICATIONS PÉDIATRIQUES
// =============================================================================

export const CONTRE_INDICATIONS_PEDIATRIE = {
  heProscrites: [
    { nom: 'Menthe poivrée', latin: 'Mentha piperita', raison: 'Spasme laryngé' },
    { nom: 'Sauge officinale', latin: 'Salvia officinalis', raison: 'Cétones neurotoxiques' },
    { nom: 'Hysope officinale', latin: 'Hyssopus officinalis', raison: 'Cétones neurotoxiques' },
  ],
  ageMinimumVoieOrale: 6, // ans
  ageMinimumSuppositoire: 3, // ans
  regleGenerale: 'Adapter les doses suppositoires au poids de l\'enfant',
} as const;

// =============================================================================
// 6. NIVEAUX DE CONFIANCE POUR JUSTIFICATIONS
// =============================================================================

export type NiveauConfiance = 'haute' | 'moyenne' | 'faible';

export const NIVEAUX_CONFIANCE = {
  haute: {
    label: 'Confiance haute',
    description: 'Monographie EMA/HMPC, études cliniques randomisées',
    couleur: '#22c55e', // green-500
    icone: '✓✓',
  },
  moyenne: {
    label: 'Confiance moyenne',
    description: 'Usage traditionnel documenté, études observationnelles',
    couleur: '#f59e0b', // amber-500
    icone: '✓',
  },
  faible: {
    label: 'Confiance faible',
    description: 'Extrapolation théorique, données limitées',
    couleur: '#ef4444', // red-500
    icone: '?',
  },
} as const;

// =============================================================================
// 7. FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Détermine la voie d'aromathérapie appropriée selon l'indication
 */
export function determinerVoieAromatherapie(
  indication: string,
  aigu: boolean = false
): VoieAromatherapie {
  const indicLower = indication.toLowerCase();

  // Voie 2: Suppositoire si aigu ORL/pulmonaire
  if (aigu && (
    indicLower.includes('bronchite') ||
    indicLower.includes('grippe') ||
    indicLower.includes('angine') ||
    indicLower.includes('otite') ||
    indicLower.includes('sinusite') ||
    indicLower.includes('orl') ||
    indicLower.includes('pulmonaire')
  )) {
    return 'SUPPOSITOIRE';
  }

  // Voie 4: Inhalation si respiratoire léger
  if (
    indicLower.includes('rhinite') ||
    indicLower.includes('nez bouché') ||
    indicLower.includes('encombrement')
  ) {
    return 'INHALATION';
  }

  // Voie 3: Cutanée si local
  if (
    indicLower.includes('douleur') ||
    indicLower.includes('musculaire') ||
    indicLower.includes('articulaire') ||
    indicLower.includes('cutané') ||
    indicLower.includes('peau') ||
    indicLower.includes('massage')
  ) {
    return 'CUTANEE';
  }

  // Voie 1: Solution orale par défaut (fond)
  return 'SOLUTION_ORALE';
}

/**
 * Génère la posologie tunisienne selon la forme pratique
 */
export function genererPosologieTunisie(
  formePratique: FormePratiqueTunisie,
  intensite: 'leger' | 'standard' | 'intensif' = 'standard'
): string {
  switch (formePratique) {
    case 'MICROSPHERES':
      if (intensite === 'leger') return PROTOCOLES.microspheres.posologie.leger;
      if (intensite === 'intensif') return PROTOCOLES.microspheres.posologie.intensif;
      return PROTOCOLES.microspheres.posologie.standard;
    case 'MACERAT_MERE':
      return intensite === 'intensif'
        ? PROTOCOLES.macerat_mere.posologie.intensif
        : PROTOCOLES.macerat_mere.posologie.adulte;
    case 'EPS':
      if (intensite === 'intensif') return PROTOCOLES.eps.posologie.intensif;
      return PROTOCOLES.eps.posologie.standard;
    case 'SOLUTION_ORALE_HE':
      return VOIES_AROMATHERAPIE.SOLUTION_ORALE.posologie.standard;
    case 'SUPPOSITOIRES_HE':
      return VOIES_AROMATHERAPIE.SUPPOSITOIRE.posologie.adulte;
    case 'HE_CUTANEE':
      return 'Diluer 5-20% dans huile végétale, application locale';
    case 'HE_INHALATION':
      return VOIES_AROMATHERAPIE.INHALATION.methodes.humide.posologie + ' gouttes, ' +
             VOIES_AROMATHERAPIE.INHALATION.methodes.humide.duree;
    default:
      return 'Selon prescription';
  }
}

/**
 * Retourne le badge et la couleur pour une voie d'aromathérapie
 */
export function getBadgeVoieAroma(voie: VoieAromatherapie): { badge: string; couleur: string } {
  const config = VOIES_AROMATHERAPIE[voie];
  return {
    badge: config.badge,
    couleur: config.couleur,
  };
}
