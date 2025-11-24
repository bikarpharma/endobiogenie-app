import type { QuestionConfig } from "../types";

/**
 * HISTORIQUE & LIGNE DE VIE - BLOC TERRAIN
 * -------------------------------------------------
 * Ce module est transversal et non axial.
 * Il contextualise la lecture fonctionnelle et permet à l'IA
 * de distinguer un terrain constitutionnel (génétique)
 * d'un terrain acquis (chocs, mode de vie).
 *
 * SPÉCIFICITÉ : Ces données ne scorent pas, mais ORIENTENT l'interprétation
 * des autres axes via les TAGS.
 *
 * Sections :
 * - Périnatal (Le Terrain Constitutionnel)
 * - Enfance & Puberté (La Construction)
 * - Chocs & Traumas (Les Fractures)
 * - Mode de Vie (Les Facteurs Aggravants)
 */

export type HistoriqueQuestion = QuestionConfig & {
  tags?: string[];
};

const HistoriqueConfig: HistoriqueQuestion[] = [
  // ==========================================
  // 1. PÉRINATAL (Le Terrain Constitutionnel)
  // ==========================================
  {
    id: "histo_naissance",
    question: "Votre naissance a-t-elle été difficile (Césarienne, Forceps, Prématurité) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Assez", "Très difficile"],
    tooltip: "Un stress à la naissance marque l'axe corticotrope (hyper-réactivité) à vie.",
    weight: 3,
    tags: ["stress_perinatal", "hyper_cortico_constitutionnel"],
    section: "Périnatal"
  },
  {
    id: "histo_allaitement",
    question: "Avez-vous été allaité maternellement ?",
    type: "boolean",
    tooltip: "L'allaitement protège le microbiote et l'immunité muqueuse (IgA).",
    weight: 2,
    tags: ["protection_immunitaire_initiale"],
    section: "Périnatal"
  },

  // ==========================================
  // 2. ENFANCE & PUBERTÉ (La Construction)
  // ==========================================
  {
    id: "histo_croissance",
    question: "Avez-vous eu une croissance très rapide (poussées) ou des douleurs de croissance ?",
    type: "boolean",
    tooltip: "Signe d'une activité Somatotrope/Thyroïdienne intense et parfois déséquilibrée.",
    weight: 2,
    tags: ["hyper_somato_constitutionnel"],
    section: "Enfance & Puberté"
  },
  {
    id: "histo_puberte_difficile",
    question: "Votre puberté a-t-elle été difficile (Acné sévère, cycles anarchiques, retard) ?",
    type: "scale_1_5",
    scaleLabels: ["Pas du tout", "Un peu", "Modérément", "Assez", "Très difficile"],
    tooltip: "Révèle la fragilité de l'axe Gonadotrope lors de son activation.",
    weight: 2,
    tags: ["fragilite_gonadique"],
    section: "Enfance & Puberté"
  },
  {
    id: "histo_infections_enfance",
    question: "Enfant, étiez-vous tout le temps malade (ORL, Bronchites) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'un déficit immunitaire Th1 constitutionnel ou d'une immaturité adaptative.",
    weight: 2,
    tags: ["deficit_immunitaire_constitutionnel"],
    section: "Enfance & Puberté"
  },

  // ==========================================
  // 3. CHOCS & TRAUMAS (Les Fractures)
  // ==========================================
  {
    id: "histo_choc_emotionnel",
    question: "Avez-vous vécu un choc émotionnel majeur qui a marqué un 'avant/après' dans votre santé ?",
    type: "boolean",
    tooltip: "Le 'Facteur Déclencheur' en Endobiogénie. Il décompense le terrain.",
    weight: 3,
    tags: ["facteur_declencheur", "rupture_adaptation"],
    section: "Chocs & Traumas"
  },
  {
    id: "histo_surmenage",
    question: "Avez-vous vécu une période d'épuisement (Burn-out) ou de surmenage intense ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Actuellement"],
    tooltip: "Effondrement de la réserve surrénalienne. Le patient ne revient jamais à 100% sans aide.",
    weight: 3,
    tags: ["epuisement_surrenalien_historique"],
    section: "Chocs & Traumas"
  },

  // ==========================================
  // 4. MODE DE VIE (Les Facteurs Aggravants)
  // ==========================================
  {
    id: "histo_sport",
    question: "Faites-vous du sport de manière intensive (> 3x/semaine) ?",
    type: "boolean",
    tooltip: "Le sport intensif augmente le besoin en Cortisol et GH. Attention à l'épuisement.",
    weight: 2,
    tags: ["hyper_sollicitation_somato"],
    section: "Mode de Vie"
  },
  {
    id: "histo_toxiques",
    question: "Fumez-vous ou êtes-vous exposé à des toxiques réguliers ?",
    type: "boolean",
    tooltip: "Bloque les cytochromes hépatiques et augmente le stress oxydatif.",
    weight: 2,
    tags: ["surcharge_hepatique_toxique"],
    section: "Mode de Vie"
  },
  {
    id: "histo_sommeil_decale",
    question: "Travaillez-vous en horaires décalés (nuit, 3x8) ?",
    type: "boolean",
    tooltip: "Le pire perturbateur endocrinien. Dérègle le couple Cortisol/Mélatonine.",
    weight: 3,
    tags: ["dysregulation_chronobio_majeure"],
    section: "Mode de Vie"
  }
];

export default HistoriqueConfig;
